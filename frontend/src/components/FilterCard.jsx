import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setJobFilters } from '@/redux/jobSlice'

const fitlerData = [
    {
        fitlerType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"]
    },
    {
        fitlerType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"]
    },
    {
        fitlerType: "Salary",
        array: ["0-40k", "42-1lakh", "1lakh to 5lakh"]
    },
]

const FilterCard = () => {
    const [filters, setFilters] = useState({ location: '', industry: '', salary: '' });
    const dispatch = useDispatch();
    const changeHandler = (type, value) => {
        setFilters((prev) => ({ ...prev, [type]: value }));
    }
    useEffect(() => {
        dispatch(setJobFilters(filters));
    }, [filters, dispatch]);
    const clearFilters = () => {
        setFilters({ location: '', industry: '', salary: '' });
    }
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2 dark:text-gray-100">Filters</h2>
            <button onClick={clearFilters} className="mb-3 px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm">Clear Filters</button>
            <RadioGroup value={filters.location} onValueChange={(v) => changeHandler('location', v)}>
                <h1 className='font-bold text-lg dark:text-gray-100'>Location</h1>
                {fitlerData[0].array.map((item, idx) => {
                    const itemId = `loc-${idx}`
                    return (
                        <div className='flex items-center space-x-2 my-2 dark:text-gray-100' key={itemId}>
                            <RadioGroupItem value={item} id={itemId} />
                            <Label htmlFor={itemId}>{item}</Label>
                        </div>
                    )
                })}
            </RadioGroup>
            <RadioGroup value={filters.industry} onValueChange={(v) => changeHandler('industry', v)}>
                <h1 className='font-bold text-lg dark:text-gray-100'>Industry</h1>
                {fitlerData[1].array.map((item, idx) => {
                    const itemId = `ind-${idx}`
                    return (
                        <div className='flex items-center space-x-2 my-2 dark:text-gray-100' key={itemId}>
                            <RadioGroupItem value={item} id={itemId} />
                            <Label htmlFor={itemId}>{item}</Label>
                        </div>
                    )
                })}
            </RadioGroup>
            <RadioGroup value={filters.salary} onValueChange={(v) => changeHandler('salary', v)}>
                <h1 className='font-bold text-lg dark:text-gray-100'>Salary</h1>
                {fitlerData[2].array.map((item, idx) => {
                    const itemId = `sal-${idx}`
                    return (
                        <div className='flex items-center space-x-2 my-2 dark:text-gray-100' key={itemId}>
                            <RadioGroupItem value={item} id={itemId} />
                            <Label htmlFor={itemId}>{item}</Label>
                        </div>
                    )
                })}
            </RadioGroup>
        </div>
    )
}

export default FilterCard