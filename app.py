import streamlit as st
import google.generativeai as genai
from PIL import Image

# 1. Configuración de la Ventana
st.set_page_config(page_title="Consultor IA Automotriz", page_icon="💼", layout="centered")

# 2. Título y Estilo Corporativo
st.markdown("""
    <h1 style='text-align: center; color: #004aad;'>💼 Consultor de Inversión Automotriz</h1>
    <p style='text-align: center; font-size: 1.1em;'>
        Herramienta de Business Intelligence para detectar oportunidades y estafas en la compra de vehículos.
    </p>
""", unsafe_allow_html=True)

# 3. Barra Lateral (API Key)
with st.sidebar:
    st.header("🔐 Acceso Gerencial")
    api_key = st.text_input("Ingresa tu API Key:", type="password")
    st.caption("Sistema potenciado por Google Gemini 1.5 Flash")

# 4. Pestañas para elegir modo
tab1, tab2 = st.tabs(["📸 Analizar Foto/Pantallazo", "📝 Analizar Texto/Link"])

# --- MODO FOTO ---
with tab1:
    st.write("Sube pantallazos de Marketplace, fotos del motor o comprobantes.")
    uploaded_file = st.file_uploader("Subir evidencia visual", type=["jpg", "png", "jpeg"])
    
    if uploaded_file:
        image = Image.open(uploaded_file)
        # CORRECCIÓN FINAL: Usamos 'use_container_width' para borrar el aviso amarillo
        st.image(image, caption="Imagen cargada", use_container_width=True)
        
        if st.button("🔍 Ejecutar Análisis Visual"):
            if not api_key:
                st.error("⚠️ Faltan las credenciales (API Key).")
            else:
                with st.spinner('Procesando imagen con Visión Artificial...'):
                    try:
                        genai.configure(api_key=api_key)
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        prompt = """
                        Actúa como un experto mecánico y tasador de autos en Chile.
                        Analiza esta imagen detalladamente.
                        1. Si es un auto: Busca defectos visibles, choques o piezas faltantes.
                        2. Si es una conversación/comprobante: Detecta señales de estafa.
                        3. Veredicto: ¿Es seguro proceder?
                        """
                        response = model.generate_content([prompt, image])
                        st.success("✅ Informe Generado")
                        st.write(response.text)
                    except Exception as e:
                        st.error(f"Error de conexión: {e}")

# --- MODO TEXTO ---
with tab2:
    st.write("Pega la descripción del vendedor o los mensajes sospechosos.")
    texto_input = st.text_area("Datos del vehículo o conversación:", height=150)
    
    if st.button("📊 Generar Informe de Riesgo"):
        if not api_key:
            st.error("⚠️ Faltan las credenciales (API Key).")
        else:
            with st.spinner('Analizando patrones de mercado...'):
                try:
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    prompt = f"""
                    Actúa como consultor de negocios automotrices. Analiza este texto:
                    "{texto_input}"
                    
                    Genera un reporte con:
                    1. Análisis de precio (¿Sospechoso o Real?).
                    2. Fallas mecánicas comunes para este modelo específico.
                    3. Veredicto de Inversión: (Comprar / Negociar / Huir).
                    """
                    response = model.generate_content(prompt)
                    st.info("📋 Reporte de Inteligencia de Negocios")
                    st.markdown(response.text)
                except Exception as e:
                    st.error(f"Error: {e}")
