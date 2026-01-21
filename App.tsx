
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Upload, Search, ShieldCheck, History, AlertTriangle, MessageCircle, CreditCard, ArrowRight, Zap, Info } from 'lucide-react';
import { AnalysisState, ScamAnalysis } from './types';
import { analyzeImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
    image: null,
  });

  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    const savedCount = localStorage.getItem('detector_usage_count');
    if (savedCount) setUsageCount(parseInt(savedCount));
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (usageCount >= 3) {
      setState(prev => ({ ...prev, error: "Has agotado tus 3 análisis gratuitos. Suscríbete para continuar." }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setState({ loading: true, result: null, error: null, image: base64 });

      try {
        const analysis = await analyzeImage(base64);
        setState(prev => ({ ...prev, loading: false, result: analysis }));
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('detector_usage_count', newCount.toString());
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: "Error al analizar la imagen. Inténtalo de nuevo." }));
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setState({ loading: false, result: null, error: null, image: null });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="p-2 bg-red-600 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">EL DETECTOR <span className="text-red-500">DE CUENTOS</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>{3 - usageCount} análisis gratis</span>
            </div>
            <button className="text-sm font-medium hover:text-red-400 transition-colors">Premium</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12">
        {!state.image && !state.loading ? (
          <HeroSection onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Analysis Header */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 aspect-[9/16] md:aspect-auto max-h-[500px] overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-900 relative group">
                {state.image && <img src={state.image} alt="Preview" className="w-full h-full object-contain" />}
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 w-full space-y-6">
                {state.loading ? (
                  <LoadingView />
                ) : state.error ? (
                  <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-2xl flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="font-bold text-red-400">Hubo un problema</h3>
                      <p className="text-sm text-red-300/80">{state.error}</p>
                    </div>
                  </div>
                ) : state.result ? (
                  <ResultContent result={state.result} />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2024 El Detector de Cuentos. Impulsado por Gemini Vision AI.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Reportar Estafa</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HeroSection: React.FC<{ onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ onFileUpload }) => {
  return (
    <div className="text-center space-y-12">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-2">
          <ShieldAlert className="w-4 h-4" />
          Marketplace & WhatsApp Guardian
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
          Que no te envuelvan con la <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">labia</span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl">
          Sube un pantallazo de tu conversación o comprobante. Nuestra IA analiza psicología de estafadores y edición de imágenes en segundos.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-800 rounded-3xl cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group bg-slate-900/50 overflow-hidden">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-slate-800 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-red-500 transition-all">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-white" />
            </div>
            <p className="mb-2 text-lg text-slate-300 font-semibold">Subir captura de pantalla</p>
            <p className="text-sm text-slate-500">WhatsApp, Marketplace, Comprobantes... (PNG, JPG)</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        <FeatureCard 
          icon={<MessageCircle className="w-6 h-6 text-blue-400" />} 
          title="Análisis de Labia" 
          desc="Detecta presión psicológica y urgencia artificial en el chat." 
        />
        <FeatureCard 
          icon={<Search className="w-6 h-6 text-purple-400" />} 
          title="Forense de Fuentes" 
          desc="Identifica si los números en el comprobante fueron editados." 
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6 text-green-400" />} 
          title="Veredicto Inmediato" 
          desc="Obtén un nivel de riesgo de 0 a 100 en un solo clic." 
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-left hover:border-slate-700 transition-colors">
    <div className="mb-4">{icon}</div>
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <p className="text-slate-400 text-sm">{desc}</p>
  </div>
);

const LoadingView: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-12 w-3/4 bg-slate-800 rounded-lg"></div>
    <div className="h-40 bg-slate-800 rounded-2xl"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-24 bg-slate-800 rounded-xl"></div>
      <div className="h-24 bg-slate-800 rounded-xl"></div>
    </div>
    <div className="space-y-2">
      <p className="text-slate-500 text-sm animate-bounce text-center">Analizando pixeles, coherencia del lenguaje y metadatos...</p>
    </div>
  </div>
);

const ResultContent: React.FC<{ result: ScamAnalysis }> = ({ result }) => {
  const isDanger = result.probability >= 70;
  const isWarning = result.probability >= 30 && result.probability < 70;
  
  const statusColor = isDanger ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500';
  const bgColor = isDanger ? 'bg-red-500/10 border-red-500/20' : isWarning ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20';

  return (
    <div className="space-y-6">
      <div className={`p-8 rounded-3xl border ${bgColor} text-center relative overflow-hidden`}>
        {/* Probability Gauge Placeholder Concept */}
        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Riesgo Detectado</p>
          <h3 className={`text-7xl font-black mb-4 ${statusColor}`}>{result.probability}%</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
             {isDanger ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-green-500" />}
             <span className={`text-xl font-bold uppercase ${statusColor}`}>{result.verdict}</span>
          </div>
          <p className="text-slate-300 max-w-lg mx-auto leading-relaxed">{result.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h4 className="flex items-center gap-2 font-bold mb-4 text-slate-200">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Señales de Alerta
          </h4>
          <ul className="space-y-3">
            {result.redFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-slate-400 flex gap-3">
                <span className="text-red-500">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h4 className="flex items-center gap-2 font-bold mb-4 text-slate-200">
            <Search className="w-4 h-4 text-purple-400" />
            Análisis Técnico
          </h4>
          <ul className="space-y-3">
            {result.visualInconsistencies.concat(result.socialEngineeringTricks).map((item, idx) => (
              <li key={idx} className="text-sm text-slate-400 flex gap-3">
                <span className="text-blue-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 bg-slate-100 rounded-2xl text-slate-900 border-l-8 border-slate-900 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-slate-950 rounded-full text-white">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg uppercase mb-1">Qué hacer ahora:</h4>
            <p className="font-medium text-slate-700">{result.recommendation}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-8 py-3 bg-slate-100 text-slate-950 font-bold rounded-xl hover:bg-white transition-all transform hover:scale-105"
        >
          Nuevo Análisis
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default App;
