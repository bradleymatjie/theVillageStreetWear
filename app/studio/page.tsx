import DesignTools from './components/DesignTools';
import DesignCanvas from './components/DesignCanvas';
import DesignLayers from './components/DesignLayers';


export default function DesignStudio() {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <DesignTools />
        <DesignCanvas />
        <DesignLayers />
      </div>
    </div>
  );
}