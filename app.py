import streamlit as st
import google.generativeai as genai
from PIL import Image

# Configuración de la página
st.set_page_config(page_title="Detector de Estafas Chile", page_icon="🕵️‍♂️")

# Título y bajada
st.markdown("""
    <h1 style='text-align: center; color: #d32f2f;'>🕵️‍♂️ Detector de Estafas Chile</h1>
    <p style='text-align: center; font-size: 1.2em;'>Sube el pantallazo (WhatsApp, Banco, Marketplace) y la IA te dirá si es cuento.</p>
""", unsafe_allow_html=True)

# Sidebar para la llave
with st.sidebar:
    st.header("⚙️ Configuración")
    api_key = st.text_input("Pega tu API Key de Google aquí:", type="password")

# Área de subida
uploaded_file = st.file_uploader("📸 Sube la evidencia aquí (Foto)", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Mostrar imagen
    image = Image.open(uploaded_file)
    st.image(image, caption='Evidencia subida', use_column_width=True)

    # Botón de acción
    if st.button("🚨 ANALIZAR AHORA"):
        if not api_key:
            st.error("✋ ¡ALTO! Falta la API Key en el menú de la izquierda.")
        else:
            with st.spinner('🕵️‍♂️ La IA está interrogando a la imagen...'):
                try:
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    
                    prompt = """
                    Analiza esta imagen con mentalidad de chileno desconfiado.
                    Busca:
                    1. Ediciones truchas en comprobantes (fuentes distintas).
                    2. Lenguaje de estafador ("amigo transfiera ya", mala ortografía).
                    3. Precios imposibles en Marketplace.
                    
                    Responde con:
                    - 🛑 VEREDICTO: (ESTAFA / SOSPECHOSO / REAL)
                    - 💀 NIVEL DE PELIGRO: 0-100%
                    - 🗣️ EL ANÁLISIS: Explica por qué, corto y preciso.
                    """
                    
                    response = model.generate_content([prompt, image])
                    st.success("¡Análisis Completado!")
                    st.write(response.text)
                    
                except Exception as e:
                    st.error(f"Error técnico: {e}")
