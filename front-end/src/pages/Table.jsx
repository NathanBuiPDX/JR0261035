import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';

const statuses = ["Launched", "Discontinue"];
const Table = () => {
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [processors, setProcessors] = useState(null);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: {
            collection: { value: null},
            status: { value: null},
            lithography: { value: null},
            segment: { value: null}
        }
    });

    useEffect(() => {
        retrieveData();
    }, [lazyState]);

    const retrieveData = async () => {
        setLoading(true);
        let result = await getProcessors({ lazyQuery: JSON.stringify(lazyState) });
        setProcessors(result.data);
        setTotalRecords(result.totalRecords);
        setLoading(false);
    }

    const getProcessors = (params) => {
        const queryParams = params ? Object.keys(params).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&') : '';
        return fetch('http://localhost:8000/processors?' + queryParams).then((res) => res.json());
    }

    const onPage = (event) => {
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

    const filterDropdown = (id) => {
        return (
            <Dropdown id={id} value={lazyState.filters[id].value} options={statuses} onChange={handleFilterChange} placeholder="Select One" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    return (
        <div className="card">
            <DataTable value={processors} lazy filterDisplay="row" dataKey="id" paginator
                    first={lazyState.first} rows={10} totalRecords={totalRecords} onPage={onPage}
                    sortField={lazyState.sortField} sortOrder={lazyState.sortOrder}
                    filters={lazyState.filters} loading={loading} tableStyle={{ minWidth: '75rem' }}
                    >
                {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> */}
                <Column field="name" header="Name" />
                <Column field='Essentials.Product Collection' filter header="Collection" filterElement={() => filterDropdown("collection")} />
                <Column field="Essentials.Status" filter header="Status" filterElement={() => filterDropdown("status")}/>
                <Column field="Essentials.Lithography" header="Lithography" filter filterElement={() => filterDropdown("lithography")} />
                <Column field="Essentials.Vertical Segment" header="Vertical Segment" filter filterElement={() => filterDropdown("segment")} />
            </DataTable>
        </div>
    );
};

export default Table;