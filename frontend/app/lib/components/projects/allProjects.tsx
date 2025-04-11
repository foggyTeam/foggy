'use client';
import { Project } from '@/app/lib/types/definitions';
import SectionHeader from '@/app/lib/components/sectionHeader';
import settingsStore from '@/app/stores/settingsStore';
import { useEffect, useState } from 'react';

export default function AllProjects({ projects }: { projects: Project[] }) {
  const [filterValue, setFilterValue] = useState();
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [onlyWithNotification, setOnlyWithNotification] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {}, [filterValue, onlyFavorite, onlyWithNotification]);

  const addNewProject = () => {
    console.log('new project!');
  };
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <SectionHeader
        sectionTitle={settingsStore.t.main.myProjects}
        favoriteFilter={onlyFavorite}
        setFavoriteFilter={setOnlyFavorite}
        notificationFilter={onlyWithNotification}
        setNotificationFilter={setOnlyWithNotification}
        addNew={addNewProject}
        onValueChange={setFilterValue}
        value={filterValue}
      />
      <div>
        {filteredProjects.map((project) => (
          <p>{project.name}</p>
        ))}
      </div>
    </div>
  );
}
