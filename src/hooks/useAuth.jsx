//useAuth.jsx - contexto global de autenticación
//Provee el usuario y perfil a toda la aplicación sin tener que pasarlas como props

import {useState, useEffect, createContext, useContext} from 'react'
import {supabase, getProfile} from '../services/supabase'

export const AuthContext = createContext() //"Almacen global" donde guarda los dats del usuario

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null) //Sesion de Supabase Auth
    const [profile, setProfile] = useState(null) //Datos de la tabla profile
    const [loading, setLoading] = useState(true) //Indica si se está cargando la autenticación

    useEffect(() => {
        //Para cargar la sesion que ya existe (si el usuario ya habia iniciado sesión)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                loadProfile(session.user.id)
            }else {
                setLoading(false)
            }
        })
        
        //Escucha cambios en la sesión, referesh token, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session?.user) {
                loadProfile(session.user.id)
            }else {
                setProfile(null)
                setLoading(false)
            }
        })
        return () => subscription.unsubscribe() //Limpia el listener cuando el componente se desmonta
    }, [])

    //Función para cargar el perfil del usuario
    async function loadProfile(userId) {
        setLoading(true)
        const {data} = await getProfile(userId)
        setProfile(data)
        setLoading(false)
    }
    
    //Funcion para referscar el perfil de manera manual
    async function refreshProfile() {
        if (!session?.user) return
        const {data} = await getProfile(session.user.id)
        setProfile(data)
    }

    return (
        <AuthContext.Provider value={{ 
            session, 
            profile, 
            loading, 
            refreshProfile,
            isPatient: profile?.role === 'patient',
            isPsychologist: profile?.role === 'psychologist',
         }}>
            {children}
         </AuthContext.Provider>
    )
}
//Hook personalizado para usar el contexto de autenticación
export function useAuth() {
    return useContext(AuthContext)
}