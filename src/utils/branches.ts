export const BRANCH_CLUSTERS = {
  cs_tech: {
    label: 'CS / Tech Cluster',
    branches: [
      'Computer Engineering', 'Computer Science', 'CSE', 'Information Technology', 'IT',
      'Artificial Intelligence', 'Data Science', 'AIML', 'Computer Science & Design'
    ],
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800',
  },
  core_circuit: {
    label: 'Core Circuit Cluster',
    branches: [
      'Electronics & Telecommunication', 'EnTC', 'Electronics', 'Electrical'
    ],
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800',
  },
  core_heavy: {
    label: 'Core Heavy Cluster',
    branches: [
      'Mechanical', 'Civil', 'Chemical', 'Automobile'
    ],
    color: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700',
  },
};

export function isInCluster(branch: string, clusterKey: 'cs_tech' | 'core_circuit' | 'core_heavy'): boolean {
  return BRANCH_CLUSTERS[clusterKey].branches.includes(branch);
}
