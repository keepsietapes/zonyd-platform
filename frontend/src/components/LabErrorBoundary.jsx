import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class LabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("The Lab Engine Error:", error, errorInfo);
    // Aquí se podría enviar a Sentry
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 border-2 border-dashed border-red-500/50 rounded-2xl bg-red-500/5 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Error en el motor de audio</h3>
            <p className="text-gray-400 max-w-md">
              Hubo un problema al procesar el audio en tu navegador. Esto puede deberse a falta de memoria o un formato no compatible.
            </p>
          </div>
          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all font-medium"
          >

            <RefreshCcw size={18} />
            Reiniciar The Lab
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LabErrorBoundary;
