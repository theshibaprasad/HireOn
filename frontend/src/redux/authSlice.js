import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from 'jwt-decode';

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null
    },
    reducers:{
        // actions
        setLoading:(state, action) => {
            state.loading = action.payload;
        },
        setUser:(state, action) => {
            const { token } = action.payload;
            state.token = token;
            if (token) {
                const decoded = jwtDecode(token);
                state.user = decoded;
            } else {
                state.user = null;
            }
        },
        logout:(state) => {
            state.user = null;
            state.token = null;
        }
    }
});
export const {setLoading, setUser, logout} = authSlice.actions;
export default authSlice.reducer;