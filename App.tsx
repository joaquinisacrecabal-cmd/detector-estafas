
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Upload, Search, ShieldCheck, AlertTriangle, 
  MessageCircle, ArrowRight, Zap, Info, Share2, 
  ChevronRight, Fingerprint, Eye, ShieldX
} from 'lucide-react';
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

    if (usageCount >= 10) { // Incrementado para pruebas
      setState(prev => ({ ...prev, error: "Has agotado tus análisis gratuitos. Suscríbete para continuar protegiéndote." }));
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500/30">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={reset}>
            <div className="p-2 bg-red-600 rounded-lg group-hover:rotate-12 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter">EL DETECTOR <span className="text-red-500 italic">DE CUENTOS</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>{Math.max(0, 10 - usageCount)} Análisis Libres</span>
            </div>
            <button className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Pro</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-16">
        {!state.image && !state.loading ? (
          <HeroSection onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Preview Box */}
              <div className="w-full md:w-80 shrink-0 aspect-[3/4] md:aspect-auto md:h-[500px] overflow-hidden rounded-3xl border-2 border-slate-800 bg-slate-900 relative shadow-2xl shadow-red-500/5">
                {state.image && <img src={state.image} alt="Preview" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 p-3 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700 hover:bg-slate-800 transition-colors z-10"
                >
                  <Upload className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Evidencia Digital</p>
                   <p className="text-xs text-slate-300 truncate">Captura_Analisis_{new Date().getTime()}.png</p>
                </div>
              </div>

              {/* Dynamic Analysis Area */}
              <div className="flex-1 w-full min-h-[500px]">
                {state.loading ? (
                  <ScanningSequence />
                ) : state.error ? (
                  <div className="p-8 bg-red-950/20 border border-red-500/30 rounded-3xl flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-red-500 rounded-full shadow-lg shadow-red-500/20">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400">Escaneo Interrumpido</h3>
                      <p className="text-slate-400 mt-2">{state.error}</p>
                    </div>
                    <button onClick={reset} className="mt-4 px-6 py-2 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-all">Reintentar</button>
                  </div>
                ) : state.result ? (
                  <ResultContent result={state.result} onReset={reset} />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black mb-2">EL DETECTOR</h3>
              <p className="text-slate-500 text-sm max-w-xs">Protegiendo a la comunidad de estafas digitales con inteligencia artificial avanzada.</p>
            </div>
            <div className="flex gap-12 text-xs font-bold uppercase tracking-widest text-slate-500">
              <div className="space-y-3">
                <p className="text-slate-300">Herramientas</p>
                <a href="#" className="block hover:text-red-500 transition-colors">Marketplace Scan</a>
                <a href="#" className="block hover:text-red-500 transition-colors">Recibo Check</a>
              </div>
              <div className="space-y-3">
                <p className="text-slate-300">Legal</p>
                <a href="#" className="block hover:text-red-500 transition-colors">Privacidad</a>
                <a href="#" className="block hover:text-red-500 transition-colors">Términos</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HeroSection: React.FC<{ onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ onFileUpload }) => {
  return (
    <div className="space-y-24">
      <div className="text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
          <Fingerprint className="w-3 h-3" />
          Escaneo Forense Digital 2.0
        </div>
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            DETENER UNA ESTAFA <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-gradient">EMPIEZA AQUÍ.</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            No caigas en el cuento. Sube una captura de WhatsApp o Marketplace y deja que nuestra IA detecte patrones de engaño y ediciones fraudulentas.
          </p>
        </div>

        <div className="max-w-xl mx-auto pt-4">
          <label className="relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-slate-800 rounded-[40px] cursor-pointer hover:border-red-500/40 hover:bg-red-500/[0.02] transition-all group bg-slate-900/40 overflow-hidden shadow-2xl">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 transition-all duration-500 shadow-xl group-hover:shadow-red-500/20">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-white" />
              </div>
              <p className="text-xl text-slate-200 font-bold mb-1">Haz clic para analizar</p>
              <p className="text-sm text-slate-500 font-medium">Arrastra un pantallazo o búscalo en tu galería</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-900 pt-16">
        <EstafaCard 
          title="El Tío en Aprietos" 
          desc="Te escriben diciendo que un familiar tuvo un accidente y necesita dinero urgente. Buscamos errores de lenguaje y presión emocional."
        />
        <EstafaCard 
          title="Transferencia Fantasma" 
          desc="Te envían un comprobante de pago editado. Nuestra IA detecta inconsistencias en fuentes, logos y alineación de números."
        />
        <EstafaCard 
          title="Vendedor marketplace" 
          desc="Precios absurdamente bajos y excusas para no verse en persona. Analizamos el guion típico de manipulación."
        />
      </div>
    </div>
  );
};

const EstafaCard: React.FC<{ title: string, desc: string }> = ({ title, desc }) => (
  <div className="group p-8 bg-slate-900/30 border border-slate-900 rounded-3xl hover:border-slate-800 transition-all">
    <div className="flex justify-between items-start mb-6">
       <h4 className="font-black text-xl text-slate-100 group-hover:text-red-500 transition-colors uppercase italic">{title}</h4>
       <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/20 transition-colors">
         <ShieldX className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
       </div>
    </div>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ScanningSequence: React.FC = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Cargando motores de visión...",
    "Extrayendo capas de metadatos...",
    "Analizando micro-ediciones en fuentes...",
    "Evaluando psicología del mensaje...",
    "Cruzando con base de datos de estafas...",
    "Generando veredicto final..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-12">
      <div className="relative w-48 h-48">
        {/* Animated Rings */}
        <div className="absolute inset-0 border-4 border-red-500/20 rounded-full animate-[ping_3s_linear_infinite]" />
        <div className="absolute inset-4 border-4 border-red-500/40 rounded-full animate-[ping_2s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-red-500/40">
              <Eye className="w-10 h-10 text-white" />
           </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 w-8 rounded-full transition-all duration-500 ${i <= step ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />
          ))}
        </div>
        <p className="text-xl font-black italic uppercase tracking-tighter text-white animate-pulse">
          {steps[step]}
        </p>
        <div className="text-[10px] font-mono text-slate-500 flex flex-col gap-1">
           <span>HEX: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}... OK</span>
           <span>FREQ: {Math.floor(Math.random() * 1000)}HZ... OK</span>
        </div>
      </div>
    </div>
  );
};

const ResultContent: React.FC<{ result: ScamAnalysis, onReset: () => void }> = ({ result, onReset }) => {
  const isDanger = result.probability >= 70;
  const isWarning = result.probability >= 30 && result.probability < 70;
  
  const statusColor = isDanger ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500';
  const statusBg = isDanger ? 'bg-red-500/10 border-red-500/20' : isWarning ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20';

  const shareOnWhatsApp = () => {
    const text = `🚨 *ALERTA DE SEGURIDAD* 🚨\n\nAnalicé una sospecha en "El Detector de Cuentos" y el resultado es: *${result.verdict}* (${result.probability}% de riesgo).\n\n⚠️ *Señales encontradas:* \n- ${result.redFlags[0] || 'Patrón de estafa común'}\n\n💡 *Recomendación:* ${result.recommendation}\n\nCuídate de los cuentos digitales.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Veredicto Hero */}
      <div className={`p-10 rounded-[40px] border-2 ${statusBg} relative overflow-hidden group shadow-2xl`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
           {isDanger ? <ShieldX className="w-32 h-32" /> : <ShieldCheck className="w-32 h-32" />}
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Análisis de Probabilidad</span>
            <div className="relative flex items-center justify-center">
               <svg className="w-32 h-32 -rotate-90">
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                   strokeDasharray={364} strokeDashoffset={364 - (364 * result.probability) / 100}
                   className={`transition-all duration-1000 ease-out ${statusColor}`}
                 />
               </svg>
               <span className={`absolute text-3xl font-black italic ${statusColor}`}>{result.probability}%</span>
            </div>
          </div>
          
          <h3 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter ${statusColor}`}>
            ¡{result.verdict}!
          </h3>
          <p className="text-slate-300 text-lg max-w-xl font-medium leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl">
          <h4 className="flex items-center gap-3 font-black text-xs uppercase tracking-widest mb-6 text-slate-400">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Banderas Rojas
          </h4>
          <ul className="space-y-4">
            {result.redFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-4 group">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 group-hover:scale-150 transition-transform" />
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl">
          <h4 className="flex items-center gap-3 font-black text-xs uppercase tracking-widest mb-6 text-slate-400">
            <Search className="w-4 h-4 text-blue-500" />
            Evidencia Técnica
          </h4>
          <ul className="space-y-4">
            {result.visualInconsistencies.concat(result.socialEngineeringTricks).map((item, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-4 group">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 group-hover:scale-150 transition-transform" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations Banner */}
      <div className="bg-white p-8 rounded-[32px] text-slate-950 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-white/5">
        <div className="p-4 bg-slate-950 rounded-2xl shrink-0">
          <Info className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Plan de Acción Sugerido</p>
          <p className="text-xl font-bold leading-tight">{result.recommendation}</p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <button 
          onClick={shareOnWhatsApp}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase italic text-sm tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-600/20"
        >
          <Share2 className="w-4 h-4" />
          Advertir a un amigo
        </button>
        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-white text-slate-950 font-black uppercase italic text-sm tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-white/5"
        >
          Nuevo Análisis
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default App;
