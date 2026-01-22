import streamlit as st
import google.generativeai as genai
from PIL import Image

st.set_page_config(page_title="Detector Estafas", page_icon="🛡️")
st.markdown("<h1 style='text-align: center; color: #b71c1c;'>🛡️ Detector Anti-Estafas</h1>", unsafe_allow_html=True)

# Sidebar
api_key = st.sidebar.text_input("Pega tu API Key:", type="password")

# Pestañas
tab1, tab2 = st.tabs(["📸 FOTO", "📝 TEXTO"])

def analizar(prompt_text, imagen_input=None):
    if not api_key:
        st.error("❌ Falta la API Key")
        return

    with st.spinner('Conectando con Google...'):
        try:
            genai.configure(api_key=api_key)
            # Usamos SOLO el modelo Flash que es el rápido y actual
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            if imagen_input:
                response = model.generate_content([prompt_text, imagen_input])
            else:
                response = model.generate_content(prompt_text)
            
            st.success("✅ ANÁLISIS COMPLETADO:")
            st.write(response.text)

        except Exception as e:
            st.error(f"⚠️ Error Técnico: {e}")
            st.warning("SOLUCIÓN: Ve al menú de tu App en Streamlit -> 'Manage App' -> 'Reboot'. Si no funciona, bórrala y créala de nuevo.")

# PESTAÑA 1
with tab1:
    uploaded_file = st.file_uploader("Sube pantallazo", type=["jpg", "png", "jpeg"])
    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, caption="Evidencia", use_container_width=True)
        if st.button("Analizar Foto"):
            analizar("Analiza esta imagen. ¿Es estafa? ¿Es real? Responde corto.", image)

# PESTAÑA 2
with tab2:
    texto = st.text_area("Pega el texto:")
    if st.button("Analizar Texto"):
        analizar(f"Analiza este texto. ¿Es estafa? {texto}")
