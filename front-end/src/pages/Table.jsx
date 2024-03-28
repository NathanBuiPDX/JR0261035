import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const Table = () => {
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [processors, setProcessors] = useState(null);
    const [filterOptions, setFilterOptions] = useState({});
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        filters: {
            "name": {value: null},
            "Product Collection": { value: null},
            "Status": { value: null},
            "Lithography": { value: null},
            "Vertical Segment": { value: null}
        }
    });
    let searchTimeout = 0;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try{
                await retrieveFilterOptions();
                await retrieveData();
            } catch(e) {
                console.log(e);
            }
            setLoading(false);
        }
        fetchData();
    }, [lazyState]);

    const retrieveData = async () => {
        let result = await getProcessors({ lazyQuery: JSON.stringify(lazyState) });
        setProcessors(result.data);
        setTotalRecords(result.totalRecords);
    }
    

    const retrieveFilterOptions = async () => {
        try{
            let res = await fetch('http://localhost:8000/processors/uniqueEssentials');
            res = await res.json();
            setFilterOptions(res);
        } catch(e) {
            console.log(e)
        }
    }

    const getProcessors = (params) => {
        const queryParams = params ? Object.keys(params).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&') : '';
        return fetch('http://localhost:8000/processors?' + queryParams).then((res) => res.json());
    }

    const onPage = (event) => {
        console.log("event: ", event)
        setlazyState(event);
    };

    const handleFilterChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = e.target.id;
        let value = e.target.value || null;
        let newState = {...lazyState};
        newState.filters[id].value = value;
        setlazyState(newState);
    }

    const handleSearchChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(e.target.value);
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            let value = e.target.value || null;
            let newState = {...lazyState};
            newState.filters["name"].value = value;
            setlazyState(newState);
        },500)
    }

    const filterDropdown = (id) => {
        return (
            <Dropdown id={id} value={lazyState.filters[id].value} options={filterOptions[id]} onChange={handleFilterChange} placeholder="Select One" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    const searhInput =(e) => {
        return <InputText placeholder='Search' onChange={handleSearchChange}/>
    }

    return (
        <div className="card">
            <DataTable value={processors} lazy filterDisplay="row" dataKey="id" paginator
                    first={lazyState.first} rows={10} totalRecords={totalRecords} onPage={onPage}
                    filters={lazyState.filters} loading={loading} tableStyle={{ minWidth: '75rem' }}
                    >
                {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> */}
                <Column field="name" header="Name" filter filterPlaceholder="Search" showFilterMenu={false} filterElement={searhInput}/>
                <Column field='Essentials.Product Collection' showFilterMenu={false} filter header="Collection" filterElement={() => filterDropdown("Product Collection")} />
                <Column field="Essentials.Status" showFilterMenu={false} filter header="Status" filterElement={() => filterDropdown("Status")}/>
                <Column field="Essentials.Lithography" showFilterMenu={false} header="Lithography" filter filterElement={() => filterDropdown("Lithography")} />
                <Column field="Essentials.Vertical Segment" showFilterMenu={false} header="Vertical Segment" filter filterElement={() => filterDropdown("Vertical Segment")} />
            </DataTable>
        </div>
    );
};

export default Table;