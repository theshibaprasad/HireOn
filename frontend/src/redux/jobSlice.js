import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allAdminJobs:[],
        singleJob:null, 
        searchJobByText:"",
        allAppliedJobs:[],
        searchedQuery:"",
        browseJobs:[],
        jobFilters: { location: '', industry: '', salary: '' },
        savedJobs: [],
    },
    reducers:{
        // actions
        setAllJobs:(state,action) => {
            state.allJobs = action.payload;
        },
        setBrowseJobs:(state,action) => {
            state.browseJobs = action.payload;
        },
        setSingleJob:(state,action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs:(state,action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText:(state,action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs:(state,action) => {
            state.allAppliedJobs = action.payload;
        },
        setSearchedQuery:(state,action) => {
            state.searchedQuery = action.payload;
        },
        setJobFilters:(state,action) => {
            state.jobFilters = action.payload;
        },
        setSavedJobs:(state,action) => {
            state.savedJobs = action.payload;
        }
    }
});
export const {
    setAllJobs, 
    setBrowseJobs,
    setSingleJob, 
    setAllAdminJobs,
    setSearchJobByText, 
    setAllAppliedJobs,
    setSearchedQuery,
    setJobFilters,
    setSavedJobs
} = jobSlice.actions;
export default jobSlice.reducer;