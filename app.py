import streamlit as st
import google.generativeai as genai
from PIL import Image

# 1. Configuración Visual
st.set_page_config(page_title="Detector de Estafas Chile", page_icon="🛡️", layout="centered")

# 2. Título Agresivo y Claro
st.markdown("""
    <h1 style='text-align: center; color: #b71c1c;'>🛡️ Ciberseguridad & Antifraude</h1>
    <p style='text-align: center; font-size: 1.1em;'>
        Inteligencia Artificial para detectar estafas en WhatsApp, Instagram, Marketplace y Bancos.
    </p>
""", unsafe_allow_html=True)

# 3. Sidebar
with st.sidebar:
    st.header("🔑 Configuración")
    api_key = st.text_input("Tu API Key:", type="password")
    st.info("Detecta: Comprobantes falsos, Phishing, Amenazas, Perfiles Fake.")

# 4. Pestañas para todo tipo de estafa
tab1, tab2 = st.tabs(["📸 Analizar Pantallazo", "📝 Analizar Texto/Chat"])

# --- PESTAÑA 1: IMÁGENES (Comprobantes, Perfiles, Chats) ---
with tab1:
    st.write("Sube pantallazos de: Transferencias, Perfiles de IG/Marketplace, Conversaciones de WhatsApp.")
    uploaded_file = st.file_uploader("Sube la imagen aquí", type=["jpg", "png", "jpeg"])
    
    if uploaded_file:
        image = Image.open(uploaded_file)
        # Sin el error amarillo
        st.image(image, caption="Evidencia a analizar", use_container_width=True)
        
        if st.button("🚨 ESCANEAR EVIDENCIA"):
            if not api_key:
                st.error("Falta la API Key.")
            else:
                with st.spinner('Rastreando patrones de fraude...'):
                    try:
                        genai.configure(api_key=api_key)
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        
                        prompt = """
                        Actúa como el mayor experto en Ciberseguridad de Chile.
                        Analiza esta imagen buscando SEÑALES DE PELIGRO:
                        1. Si es comprobante bancario: Busca ediciones, fuentes distintas, horas falsas.
                        2. Si es chat/perfil: Busca lenguaje de estafador, presión psicológica, amenazas.
                        3. Si es venta: Precios irreales.
                        
                        Dime DIRECTO:
                        - 🛑 VEREDICTO: (ESTAFA / SOSPECHOSO / REAL)
                        - 💀 NIVEL DE RIESGO: 0-100%
                        - 🗣️ EXPLICACIÓN: Por qué me quieren cagar.
                        """
                        
                        response = model.generate_content([prompt, image])
                        st.success("Análisis Finalizado")
                        st.markdown(response.text)
                    except Exception as e:
                        st.error(f"Error: {e}")

# --- PESTAÑA 2: TEXTO (Correos, Amenazas, Links) ---
with tab2:
    st.write("Pega aquí: Correos raros, mensajes con links, amenazas de funa o descripciones.")
    texto = st.text_area("Pega el texto sospechoso:", height=150)
    
    if st.button("🕵️‍♂️ ANALIZAR MENSAJE"):
        if not api_key:
            st.error("Falta la API Key.")
        else:
            with st.spinner('Analizando intenciones...'):
                try:
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    
                    prompt = f"""
                    Analiza este texto con mentalidad de desconfiado chileno:
                    "{texto}"
                    
                    Dime:
                    1. ¿Qué intentan hacer? (Robar datos, asustar, estafar plata).
                    2. ¿Es real o mentira?
                    3. ¿Qué debo responder o hacer?
                    """
                    
                    response = model.generate_content(prompt)
                    st.info("Informe de Seguridad")
                    st.write(response.text)
                except Exception as e:
                    st.error(f"Error: {e}")
