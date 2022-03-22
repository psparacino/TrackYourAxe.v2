function ListPageComponent(props) {
    console.log(props)
    return (
        <div>
            <h1>List of Folders</h1>
            <ul>
                {props.lists.map(list => <li key={list.dirId}>{list.name}</li>)}
            </ul>
        </div>
    )
}
export async function getStaticProps() {
    
    return {
        props: {
            lists: [
                {dirId: '1', name: 'account.toString()'},
                {dirId: '2', name: 'Directory 2'},
                {dirId: '3', name: 'Directory 3'},
                {dirId: '4', name: 'Directory 4'}
            ],
        }
    }
}
export  default ListPageComponent;