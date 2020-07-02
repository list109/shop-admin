import { template } from "@babel/core";

const header = [
    {
      id: 'id',
      title: 'ID',
      sortable: true,
    },
    {
      id: 'user',
      title: 'Client',
      sortable: true,
    },
    {
      id: 'createdAt',
      title: 'Date',
      sortable: true,
      template: date => {
        const options = {year: 'numeric', month: 'long', day: 'numeric'}
        const formatter = new Intl.DateTimeFormat("ru", options);

        return `<div class="sortable-table__cell">
            ${formatter.format(new Date(date))}
          </div>`;
      }
    },
    {
      id: 'totalCost',
      title: 'Price',
      sortable: true,
    },
    {
      id: 'delivery',
      title: 'Status',
      sortable: true,
    },
  ];
  
  export default header;