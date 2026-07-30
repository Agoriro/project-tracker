"""Risk engine — background heuristic service to analyze portfolio risks."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import Health, TaskPriority
from app.infrastructure.models import ProjectModel, TaskModel, TeamMemberModel
from app.infrastructure.repositories.project_repository import ProjectRepository
from app.infrastructure.repositories.team_repository import TeamRepository


class RiskEngineService:
    """Service for evaluating and updating portfolio risks."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._project_repo = ProjectRepository(session)
        self._team_repo = TeamRepository(session)

    async def evaluate_portfolio(self) -> dict:
        """Run the full risk evaluation on all projects and team members."""
        projects_flagged = await self._evaluate_projects()
        members_updated = await self._evaluate_team_workload()
        
        return {
            "projects_flagged_at_risk": projects_flagged,
            "team_members_updated": members_updated,
        }

    async def _evaluate_projects(self) -> int:
        """Evaluate projects and calculate risk score and risk level.
        
        Scoring:
        - +10 points for each high/critical open/overdue task.
        - +5 points for each high/critical task.
        - +3 points for each blocked task.
        
        Levels:
        - Score >= 20 -> High
        - Score >= 10 -> Medium
        - Score < 10  -> Low
        """
        result = await self._session.execute(
            select(ProjectModel).where(ProjectModel.status == "Activo")
        )
        projects = result.scalars().all()
        
        flagged_count = 0
        for project in projects:
            score = 0
            
            # Fetch all non-completed tasks for this project
            tasks_result = await self._session.execute(
                select(TaskModel)
                .where(TaskModel.project_code == project.project_code)
                .where(TaskModel.status != "Completada")
            )
            tasks = tasks_result.scalars().all()
            
            for task in tasks:
                if task.status == "Bloqueada":
                    score += 3
                
                if task.priority in [TaskPriority.ALTA, TaskPriority.CRITICA]:
                    score += 5
                    if task.is_overdue:
                        score += 5 # Additional 5 points (Total 10)
                        
            # Determine level
            level = "Low"
            health = Health.SANO
            
            if score >= 20:
                level = "High"
                health = Health.EN_RIESGO
            elif score >= 10:
                level = "Medium"
                health = Health.EN_RIESGO
            
            # Compute task metrics
            open_tasks_count = len(tasks)
            overdue_tasks_count = sum(1 for t in tasks if t.is_overdue)

            # Check if anything changed
            if (project.risk_score != score or 
                project.risk_level != level or 
                project.open_tasks != open_tasks_count or 
                project.overdue_tasks != overdue_tasks_count):
                
                project.risk_score = score
                project.risk_level = level
                project.health = health
                project.open_tasks = open_tasks_count
                project.overdue_tasks = overdue_tasks_count
                flagged_count += 1
                    
        await self._session.flush()
        return flagged_count

    async def _evaluate_team_workload(self) -> int:
        """Recalculate workload metrics for all team members."""
        result = await self._session.execute(select(TeamMemberModel))
        members = result.scalars().all()
        
        for member in members:
            alias = member.member_alias
            
            # 1. Open tasks assigned
            open_result = await self._session.execute(
                select(func.count(TaskModel.id))
                .where(TaskModel.assignee_alias == alias)
                .where(TaskModel.status != "Completada")
            )
            member.open_tasks_assigned = open_result.scalar() or 0
            
            # 2. Blocked tasks assigned
            blocked_result = await self._session.execute(
                select(func.count(TaskModel.id))
                .where(TaskModel.assignee_alias == alias)
                .where(TaskModel.status == "Bloqueada")
            )
            member.blocked_tasks_assigned = blocked_result.scalar() or 0
            
            # 3. High or critical open tasks
            critical_result = await self._session.execute(
                select(func.count(TaskModel.id))
                .where(TaskModel.assignee_alias == alias)
                .where(TaskModel.status != "Completada")
                .where(TaskModel.priority.in_([TaskPriority.ALTA, TaskPriority.CRITICA]))
            )
            member.high_or_critical_open = critical_result.scalar() or 0
            
            # 4. Project type breakdown (Diagnostico, Proyecto, Mantenimiento)
            # Count distinct projects assigned to this user by engagement_type
            proj_breakdown = await self._session.execute(
                select(TaskModel.engagement_type, func.count(TaskModel.project_code.distinct()))
                .where(TaskModel.assignee_alias == alias)
                .group_by(TaskModel.engagement_type)
            )
            
            diag = 0
            proy = 0
            mant = 0
            total_projects = 0
            
            for row in proj_breakdown:
                engagement_type, count = row
                total_projects += count
                if engagement_type == "Diagnostico":
                    diag += count
                elif engagement_type == "Proyecto":
                    proy += count
                elif engagement_type == "Mantenimiento o recurrente":
                    mant += count
                    
            member.diagnostico_projects = diag
            member.proyecto_projects = proy
            member.mantenimiento_projects = mant
            member.projects_in_portfolio = total_projects

        await self._session.flush()
        return len(members)
