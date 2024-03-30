import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Button } from "primereact/button";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { flattenObject } from "../assets/Helper";
import "./Table.css";

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
      name: { value: null },
      "Product Collection": { value: null },
      Status: { value: null },
      Lithography: { value: null },
      "Vertical Segment": { value: null },
    },
  });
  let searchTimeout = 0;

  useEffect(() => {
    if (!localStorage.getItem("processors"))
      localStorage.setItem("processors", JSON.stringify({}));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        await retrieveFilterOptions();
        await retrieveData();
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    fetchData();
  }, [lazyState]);

  const retrieveData = async () => {
    let updatedData = localStorage.getItem("processors");
    updatedData = JSON.parse(updatedData);
    let result = await getProcessors({ lazyQuery: JSON.stringify(lazyState) });
    let returnedData = result.data;

    let updatedDataKeys = Object.keys(updatedData);
    if (updatedDataKeys.length > 0) {
      updatedDataKeys.forEach((key) => {
        let idx = returnedData.findIndex((e) => e.id === key);
        if (idx > -1) returnedData[idx] = updatedData[key];
      });
    }

    setProcessors(returnedData);
    setTotalRecords(result.totalRecords);
  };

  const retrieveFilterOptions = async () => {
    try {
      let res = await axios.get(
        "http://localhost:8000/processors/uniqueEssentials"
      );
      setFilterOptions(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getProcessors = async (params) => {
    const queryParams = params
      ? Object.keys(params)
          .map(
            (k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
          )
          .join("&")
      : "";
    let result = await axios.get(
      "http://localhost:8000/processors?" + queryParams
    );
    return result.data;
  };

  const onPage = (event) => {
    setlazyState(event);
  };

  const handleFilterChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let id = e.target.id;
    let value = e.target.value || null;
    let newState = { ...lazyState };
    newState.filters[id].value = value;
    setlazyState(newState);
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      let value = e.target.value || null;
      let newState = { ...lazyState };
      newState.filters["name"].value = value;
      setlazyState(newState);
    }, 500);
  };

  const filterDropdown = (id) => {
    return (
      <Dropdown
        id={id}
        value={lazyState.filters[id].value}
        options={filterOptions[id]}
        onChange={handleFilterChange}
        placeholder="Select One"
        className="filterDropdown"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );
  };

  const searhInput = (e) => {
    return <InputText placeholder="Search" onChange={handleSearchChange} />;
  };

  const onRowEditComplete = async (e) => {
    try {
      let { newData } = e;
      let updatedData = localStorage.getItem("processors");
      updatedData = JSON.parse(updatedData);
      updatedData[newData.id] = newData;
      localStorage.setItem("processors", JSON.stringify(updatedData));
      const config = { headers: { "Content-Type": "application/json" } };
      await axios.put(
        `http://localhost:8000/processors/${newData.id}`,
        newData,
        config
      );
    } catch (e) {
      console.log(e);
      alert("Error updating table", e.message);
    }
  };

  const dropdownEditor = (options, id) => {
    return (
      <Dropdown
        value={options.value}
        options={filterOptions[id]}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select a Status"
        itemTemplate={(option) => {
          return <Tag value={option}></Tag>;
        }}
      />
    );
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const exportCSV = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let tempArr = [...processors];
    let flattenedObjArr = [];
    for (let data of tempArr) {
      flattenedObjArr.push(flattenObject(data));
    }
    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      filename: `Processors Data page-${lazyState.page + 1}`,
    });
    const csv = generateCsv(csvConfig)(flattenedObjArr);
    download(csvConfig)(csv);
  };

  const renderExportButton = () => {
    return (
      <Button
        type="button"
        icon="pi pi-file"
        className="downloadButton"
        rounded
        onClick={exportCSV}
        data-pr-tooltip="CSV"
      />
    );
  };

  return (
    <div className="card TablePage">
      <DataTable
        value={processors}
        lazy
        filterDisplay="row"
        dataKey="id"
        paginator
        first={lazyState.first}
        rows={10}
        totalRecords={totalRecords}
        onPage={onPage}
        filters={lazyState.filters}
        loading={loading}
        tableStyle={{ minWidth: "75rem" }}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
        className="table"
      >
        {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> */}
        <Column
          field="name"
          header="Name"
          editor={(options) => textEditor(options)}
          filter
          filterPlaceholder="Search"
          showFilterMenu={false}
          filterElement={searhInput}
        />
        <Column
          field="Essentials.Product Collection"
          editor={(options) => dropdownEditor(options, "Product Collection")}
          showFilterMenu={false}
          filter
          header="Collection"
          filterElement={() => filterDropdown("Product Collection")}
        />
        <Column
          field="Essentials.Status"
          editor={(options) => dropdownEditor(options, "Status")}
          showFilterMenu={false}
          filter
          header="Status"
          filterElement={() => filterDropdown("Status")}
        />
        <Column
          field="Essentials.Lithography"
          editor={(options) => dropdownEditor(options, "Lithography")}
          showFilterMenu={false}
          header="Lithography"
          filter
          filterElement={() => filterDropdown("Lithography")}
        />
        <Column
          field="Essentials.Vertical Segment"
          editor={(options) => dropdownEditor(options, "Vertical Segment")}
          showFilterMenu={false}
          header="Vertical Segment"
          filter
          filterElement={() => filterDropdown("Vertical Segment")}
        />
        <Column
          filter
          showFilterMenu={false}
          filterElement={() => renderExportButton()}
          rowEditor={true}
          headerStyle={{ width: "10%", minWidth: "8rem" }}
          bodyStyle={{ textAlign: "center" }}
        ></Column>
      </DataTable>
    </div>
  );
};

export default Table;
