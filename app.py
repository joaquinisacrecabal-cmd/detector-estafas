import streamlit as st
import google.generativeai as genai
from PIL import Image

st.set_page_config(page_title="Detector Estafas", page_icon="🛡️")
st.markdown("<h1 style='text-align: center; color: #b71c1c;'>🛡️ Detector Anti-Estafas Chile</h1>", unsafe_allow_html=True)

# Sidebar
api_key = st.sidebar.text_input("Pega tu API Key:", type="password")

uploaded_file = st.file_uploader("Sube la evidencia (Pantallazo/Foto)", type=["jpg", "png", "jpeg"])

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Evidencia", use_container_width=True)
    
    if st.button("🚨 ANALIZAR AHORA"):
        if not api_key:
            st.error("Falta la API Key")
        else:
            with st.spinner('Contactando a la IA...'):
                try:
                    genai.configure(api_key=api_key)
                    
                    # INTENTO 1: Modelo Flash (El mejor)
                    try:
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        response = model.generate_content(["Analiza si esto es estafa. Sé breve.", image])
                        st.success("✅ Análisis Flash:")
                        st.write(response.text)
                    except:
                        # INTENTO 2: Modelo Pro (El clásico, si falla el Flash)
                        st.warning("Usando modelo de respaldo...")
                        model = genai.GenerativeModel('gemini-pro-vision')
                        response = model.generate_content(["Analiza si esto es estafa.", image])
                        st.success("✅ Análisis Respaldo:")
                        st.write(response.text)
                        
                except Exception as e:
                    st.error(f"Error final: {e}")
                    st.info("Ayuda: Borra la App en Streamlit y créala de nuevo para actualizar las librerías.")
