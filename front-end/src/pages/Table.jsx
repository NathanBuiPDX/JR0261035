import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {API_DATA} from '../assets/API_DATA';

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

    const retrieveData = () => {
        setLoading(true);
        let result = API_DATA;
        const resultKey = Object.keys(result).sort((a,b) => a - b);
        // console.log("resultKey: ", resultKey)
        result = resultKey.map(key => {
            let processor = result[key];
            processor.id = key;
            return processor
        })
        console.log("result: ", result)
        setProcessors(result);
        setTotalRecords(result.length);
        setLoading(false);
    }

    const onPage = (event) => {
        console.log("on page event: ", event)
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
                <Column field='Essentials.Product Collection' sortable header="Collection" filterField="country.name" />
                <Column field="Essentials.Status" sortable filter header="Status" filterPlaceholder="Search" />
                <Column field="Essentials.Lithography" sortable header="Lithography" filter filterPlaceholder="Search" />
                <Column field="Essentials.Vertical Segment" sortable header="Vertical Segment" filter filterPlaceholder="Search" />
            </DataTable>
        </div>
    );
};

export default Table;