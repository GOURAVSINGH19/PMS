from app.repositories.base import BaseRepository
from app.models.team import Team

class TeamRepository(BaseRepository[Team]):
    def __init__(self):
        super().__init__(Team)

team_repository = TeamRepository()
