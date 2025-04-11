'use client';
import { Team } from '@/app/lib/types/definitions';

export default function AllTeams({ teams }: { teams: Team[] }) {
  return (
    <div>
      {teams.map((team) => (
        <p>{team.name}</p>
      ))}
    </div>
  );
}
