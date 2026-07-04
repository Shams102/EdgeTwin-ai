import MachineCard from './MachineCard';

export default function FleetOverview({ machines }) {
  if (!machines || machines.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No machines found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {machines.map((machine, index) => (
        <MachineCard key={machine.id} machine={machine} index={index} />
      ))}
    </div>
  );
}
