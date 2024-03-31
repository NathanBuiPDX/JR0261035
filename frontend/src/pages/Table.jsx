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
  const [selectedProcessor, setSelectedProcessor] = useState({});
  const [comparedProcessor, setComparedProcessor] = useState({});
  const [comparing, setComparing] = useState(false);
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
        placeholder="Select"
        className="filterDropdown"
        showClear
        style={{ minWidth: "100px" }}
      />
    );
  };

  const searhInput = (e) => {
    return (
      <InputText
        placeholder="Search"
        onChange={handleSearchChange}
        style={{ minWidth: "200px" }}
      />
    );
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
        className="inputNameField"
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
      />
    );
  };

  const renderCompareButton = () => {
    return (
      <Button
        type="button"
        className="compareButton"
        onClick={handleCompare}
        label={comparing ? "Cancel" : "Compare"}
        severity="help"
      />
    );
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setComparing(!comparing);
    setComparedProcessor({});
  };

  const handleSelectionChange = (e) => {
    if (comparing) setComparedProcessor(e.value);
    else setSelectedProcessor(e.value);
  };

  const renderDetailsSection = () => {
    return (
      <div className="detailsSection">
        <div className="detailsSectionHeader">Processor Details</div>
        {selectedProcessor?.id ? renderDetails() : renderEmptySectionDetails()}
      </div>
    );
  };
  const renderDetails = () => {
    let keys = Object.keys(selectedProcessor);
    if (comparedProcessor?.id) {
      let comparedKeys = Object.keys(comparedProcessor);
      keys = [...new Set([...keys, ...comparedKeys])];
    }
    keys = keys.filter((key) => key !== "id" && key !== "name");
    return (
      <div className="detailsSectionData">
        <div className="detailsSectionSubSection">
          <div className="detailsSectionSubSectionSelected">
            <div className="detailsRow">
              <div className="detailsRowKey">Processor ID:</div>
              <div className="detailsRowValueExtra">{selectedProcessor.id}</div>
            </div>
            <div className="detailsRow">
              <div className="detailsRowKey">Processor Name:</div>
              <div className="detailsRowValueExtra">
                {selectedProcessor.name}
              </div>
            </div>
          </div>
          {comparedProcessor?.id && (
            <div className="detailsSectionSubSectionCompared">
              <div className="detailsRow">
                <div className="detailsRowKey">Processor ID:</div>
                <div className="detailsRowValueExtra">
                  {comparedProcessor.id}
                </div>
              </div>
              <div className="detailsRow">
                <div className="detailsRowKey">Processor Name:</div>
                <div className="detailsRowValueExtra">
                  {comparedProcessor.name}
                </div>
              </div>
            </div>
          )}
        </div>
        {keys.map((key) => {
          return (
            <div className="detailsKey" key={key}>
              <div
                className={`detailsSectionSubHeader ${
                  comparedProcessor?.id ? "alignMiddle" : ""
                }`}
              >
                {key}
              </div>
              <div className="detailsSectionSubSection">
                <div className="detailsSectionSubSectionSelected">
                  {selectedProcessor[key]
                    ? Object.keys(selectedProcessor[key]).map((subKey) => {
                        return (
                          <div className="detailsRow" key={subKey}>
                            <div className="detailsRowKey">{subKey}:</div>
                            <div className="detailsRowValue">
                              {selectedProcessor[key][subKey]}
                            </div>
                          </div>
                        );
                      })
                    : ""}
                </div>
                {comparedProcessor?.id && (
                  <div className="detailsSectionSubSectionCompared">
                    {comparedProcessor[key]
                      ? Object.keys(comparedProcessor[key]).map((subKey) => {
                          return (
                            <div className="detailsRow" key={subKey}>
                              <div className="detailsRowKey">{subKey}:</div>
                              <div className="detailsRowValue">
                                {comparedProcessor[key][subKey]}
                              </div>
                            </div>
                          );
                        })
                      : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptySectionDetails = () => {
    return <div>Please select a row in the table for more information</div>;
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
        editMode="row"
        onRowEditComplete={onRowEditComplete}
        className="table"
        stripedRows
        selectionMode="single"
        selection={selectedProcessor}
        onSelectionChange={handleSelectionChange}
        tableStyle={{ tableLayout: "fixed" }}
        rowClassName={(rowData) => {
          if (rowData?.id === selectedProcessor?.id) return "tableSelectedRow";
          if (comparing && rowData?.id === comparedProcessor?.id)
            return "tableComparedRow";
        }}
      >
        <Column
          field="id"
          header="ID"
          filter
          showFilterMenu={false}
          filterElement={() => renderCompareButton()}
          headerStyle={{ width: "100px" }}
        />
        <Column
          field="name"
          header="Name"
          editor={(options) => textEditor(options)}
          filter
          filterPlaceholder="Search"
          showFilterMenu={false}
          filterElement={searhInput}
          headerStyle={{ width: "400px" }}
        />
        <Column
          field="Essentials.Product Collection"
          editor={(options) => dropdownEditor(options, "Product Collection")}
          showFilterMenu={false}
          filter
          header="Collection"
          filterElement={() => filterDropdown("Product Collection")}
          headerStyle={{ width: "200px" }}
        />
        <Column
          field="Essentials.Status"
          editor={(options) => dropdownEditor(options, "Status")}
          showFilterMenu={false}
          filter
          header="Status"
          filterElement={() => filterDropdown("Status")}
          headerStyle={{ width: "180px" }}
        />
        <Column
          field="Essentials.Lithography"
          editor={(options) => dropdownEditor(options, "Lithography")}
          showFilterMenu={false}
          header="Lithography"
          filter
          filterElement={() => filterDropdown("Lithography")}
          headerStyle={{ width: "120px" }}
        />
        <Column
          field="Essentials.Vertical Segment"
          editor={(options) => dropdownEditor(options, "Vertical Segment")}
          showFilterMenu={false}
          header="Segment"
          filter
          filterElement={() => filterDropdown("Vertical Segment")}
          style={{ width: "100px" }}
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
      {renderDetailsSection()}
    </div>
  );
};

export default Table;
