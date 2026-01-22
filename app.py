import streamlit as st
import google.generativeai as genai
from PIL import Image
import time

# --- CONFIGURACIÓN VISUAL ---
st.set_page_config(page_title="Detector Blindado", page_icon="🛡️")
st.markdown("<h1 style='text-align: center; color: #b71c1c;'>🛡️ Detector de Estafas (Modo Seguro)</h1>", unsafe_allow_html=True)

# --- SIDEBAR ---
api_key = st.sidebar.text_input("Pega tu API Key aquí:", type="password")

# --- FUNCIÓN INTELIGENTE (LA MAGIA) ---
def intentar_analisis(prompt, imagen=None):
    if not api_key:
        st.error("❌ Falta la API Key.")
        return

    # Lista de todos los modelos posibles (Del nuevo al viejo)
    lista_modelos = [
        'gemini-1.5-flash', 
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro-vision-latest',
        'gemini-pro-vision'
    ]

    placeholder = st.empty()
    genai.configure(api_key=api_key)

    # Bucle: Prueba uno por uno hasta que funcione
    for modelo_nombre in lista_modelos:
        try:
            placeholder.info(f"🔄 Intentando conectar con motor: {modelo_nombre}...")
            model = genai.GenerativeModel(modelo_nombre)
            
            if imagen:
                response = model.generate_content([prompt, imagen])
            else:
                response = model.generate_content(prompt)
            
            # Si llegamos aquí, FUNCIONÓ
            placeholder.success(f"✅ Conectado exitosamente con: {modelo_nombre}")
            st.markdown("### 📋 Informe de Resultados:")
            st.write(response.text)
            return # Salimos de la función felices
            
        except Exception as e:
            # Si falla, probamos el siguiente sin llorar
            time.sleep(1)
            continue
    
    # Si fallan TODOS (muy difícil), mostramos esto
    placeholder.error("💀 Error Total: Ningún modelo respondió. Verifica tu API Key.")
    
    # DIAGNÓSTICO FINAL (Solo si todo falla)
    with st.expander("Ver lista de modelos disponibles en tu cuenta"):
        try:
            for m in genai.list_models():
                st.write(f"- {m.name}")
        except:
            st.write("No se pudo obtener la lista.")

# --- INTERFAZ ---
tab1, tab2 = st.tabs(["📸 Analizar FOTO", "📝 Analizar TEXTO"])

with tab1:
    uploaded_file = st.file_uploader("Sube pantallazo o foto", type=["jpg", "png", "jpeg"])
    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, caption="Evidencia", use_container_width=True)
        if st.button("🚨 ESCANEAR IMAGEN"):
            intentar_analisis("Analiza esto. Si es estafa, dime por qué. Si es auto, dime fallas.", image)

with tab2:
    texto = st.text_area("Pega el texto sospechoso:")
    if st.button("🕵️‍♂️ ANALIZAR TEXTO"):
        intentar_analisis(f"Analiza si esto es estafa: '{texto}'")
