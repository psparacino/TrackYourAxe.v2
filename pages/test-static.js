import { Pagination } from "react-bootstrap";

function ListPageComponent(props) {
  console.log(props);
  return (
    <div>
      <h1>List of Folders</h1>
      <ul>
        {props.lists.map((list) => (
          <li key={list.dirId}>{list.name}</li>
        ))}
      </ul>
      <Pagination>
        <Pagination.First />
        <Pagination.Prev />
        <Pagination.Item>{1}</Pagination.Item>
        <Pagination.Ellipsis />

        <Pagination.Item>{10}</Pagination.Item>
        <Pagination.Item>{11}</Pagination.Item>
        <Pagination.Item active>{12}</Pagination.Item>
        <Pagination.Item>{13}</Pagination.Item>
        <Pagination.Item disabled>{14}</Pagination.Item>

        <Pagination.Ellipsis />
        <Pagination.Item>{20}</Pagination.Item>
        <Pagination.Next />
        <Pagination.Last />
      </Pagination>
    </div>
  );
}
export async function getStaticProps() {
  return {
    props: {
      lists: [
        { dirId: "1", name: "account.toString()" },
        { dirId: "2", name: "Directory 2" },
        { dirId: "3", name: "Directory 3" },
        { dirId: "4", name: "Directory 4" },
      ],
    },
  };
}
export default ListPageComponent;
