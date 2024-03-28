import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

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
        filters: {}
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

    const onSort = (event) => {
        setlazyState(event);
    };

    const onFilter = (event) => {
        event['first'] = 0;
        setlazyState(event);
    };

    return (
        <div className="card">
            <DataTable value={processors} lazy filterDisplay="row" dataKey="id" paginator
                    first={lazyState.first} rows={10} totalRecords={totalRecords} onPage={onPage}
                    onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder}
                    onFilter={onFilter} filters={lazyState.filters} loading={loading} tableStyle={{ minWidth: '75rem' }}
                    >
                {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> */}
                <Column field="name" header="Name" sortable filter filterPlaceholder="Search" />
                <Column field='Essentials.Product Collection' sortable filter header="Collection" filterField="country.name" />
                <Column field="Essentials.Status" sortable filter header="Status" filterPlaceholder="Search" />
                <Column field="Essentials.Lithography" sortable header="Lithography" filter filterPlaceholder="Search" />
                <Column field="Essentials.Vertical Segment" sortable header="Vertical Segment" filter filterPlaceholder="Search" />
            </DataTable>
        </div>
    );
};

export default Table;