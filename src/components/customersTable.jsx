import React, { Component } from "react";
import auth from "../services/authService";
import { Link } from "react-router-dom";
import Table from "./common/table";
import Counter from "./common/counter";

class CustomersTable extends Component {
  columns = [
    {
      path: "date",
      label: "Date",
      content: (customer) => (
        <p>{customer.date}</p>
      ),
    },
    {
      path: "time",
      label: "Time",
      content: (customer) => (
        <p>{customer.time}</p>
      ),
    },
    {
      path: "name",
      label: "Name",
      content: (customer) => (
        <p>{customer.name}</p>
      ),
    },
    { path: "email", label: "Email" },
    { path: "cart.title",
      label: "Items",
      content: (customer) => (
        customer.cart.map((item) => {
          return <p>{item.title}</p>
        })
      )
    },
    { path: "cart.numberOutStock",
      label: "#",
      content: (customer) => (
        customer.cart.map((item) => {
          return <p>{item.numberOutStock}</p>
        })
      )
    }
  ];

  render() {
    const { customers, onSort, sortColumn } = this.props;

    return (
      <Table
        columns={this.columns}
        data={customers}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default CustomersTable;
