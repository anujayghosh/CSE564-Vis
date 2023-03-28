// Initialize parallel coordinates plot
var pc = d3.parcoords()("#parallel_chart2");

// Fetch data from Flask server function
fetch('/parallel_data')
  .then(response => response.json())
  .then(data => {
    // Define dimensions with custom scales for categorical dimensions
    pc.dimensions([
      {
        key: "cluster_id",
        type: "number"
      },
      {
        key: "month_number",
        type: "number"
      },
      {
        key: "no_atms_off_site",
        type: "number"
      },
      {
        key: "no_atms_on_site",
        type: "number"
      },
      {
        key: "no_credit_card_atm_txn",
        type: "number"
      },
      {
        key: "no_credit_card_atm_txn_value_in_mn",
        type: "number"
      },
      {
        key: "no_credit_card_pos_txn",
        type: "number"
      },
      {
        key: "no_credit_card_pos_txn_value_in_mn",
        type: "number"
      },
      {
        key: "no_credit_cards",
        type: "number"
      },
      {
        key: "no_debit_card_atm_txn",
        type: "number"
      },
      {
        key: "no_debit_card_atm_txn_value_in_mn",
        type: "number"
      },
      {
        key: "no_debit_card_pos_txn",
        type: "number"
      },
      {
        key: "no_debit_card_pos_txn_value_in_mn",
        type: "number"
      },
      {
        key: "no_debit_cards",
        type: "number"
      },
      {
        key: "no_pos_off_line",
        type: "number"
      },
      {
        key: "no_pos_on_line",
        type: "number"
      },
      {
        key: "year",
        type: "number"
      }
    ]);

    // Define custom scales for categorical dimensions
    pc.scale("bank_name", d3.scale.ordinal());
    pc.scale("end_date", d3.scale.ordinal());
    pc.scale("month", d3.scale.ordinal());
    pc.scale("start_date", d3.scale.ordinal());

    // Render data in parallel coordinates plot
    pc.data(data).render();
  });


