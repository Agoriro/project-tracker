"""Domain enums — reflecting the exact values from the Aztec dataset."""

from enum import StrEnum


class EngagementType(StrEnum):
    """Type of engagement/contract for a project."""

    PROYECTO = "Proyecto"
    MANTENIMIENTO = "Mantenimiento o recurrente"
    DIAGNOSTICO = "Diagnostico"


class ProjectTypeAPI(StrEnum):
    """API classification of the project type."""

    AUTOMATIZACION = "Automatizacion"
    CONSULTORIA = "Consultoria"


class Stage(StrEnum):
    """Current stage of a project in the lifecycle."""

    DESCUBRIMIENTO = "Descubrimiento"
    EJECUCION = "Ejecucion"


class Health(StrEnum):
    """Health status of a project."""

    SANO = "Sano"
    EN_RIESGO = "En riesgo"
    BLOQUEADO = "Bloqueado"


class TaskPriority(StrEnum):
    """Priority level for a task."""

    BAJA = "Baja"
    MEDIA = "Media"
    ALTA = "Alta"
    CRITICA = "Critica"


class TaskStatus(StrEnum):
    """Current status of a task."""

    POR_HACER = "Por hacer"
    EN_PROGRESO = "En progreso"
    EN_REVISION = "En revision"
    BLOQUEADA = "Bloqueada"


class Currency(StrEnum):
    """Currency for business value."""

    USD = "USD"
    COP = "COP"
