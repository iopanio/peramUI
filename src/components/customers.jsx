import React, { Component } from "react";
import { getCustomers } from "../services/customerService";
import CustomersTable from "./customersTable";

class Customers extends Component {
  state = {
    customers: [],
    sortColumn: { path: "name", order: "asc" },
  };

  async componentDidMount() {
    const { data: customers } = await getCustomers();
    this.setState({ customers });
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  render() {
    const { customers, sortColumn } = this.state;
    console.log(customers);

    return (
      <div>
        <h1>Customers</h1>
        <CustomersTable
          customers={customers}
          onSort={this.handleSort}
          sortColumn={sortColumn}
        />
      </div>
    );
  }
};

export default Customers;
