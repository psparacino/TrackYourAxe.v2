//- React/NextJS Imports
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

//- Style Imports
import styles from "./Pagination.module.css";

const Pagination = ({ postsPerPage, totalPosts, paginate, slug }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const router = useRouter();

  const page = Number(router.query?.page) ? Number(router.query?.page) : 1;

  const button = (p) => {
    return p === page ? (
      <li className={styles.Selected} key={p}>
        {p}
      </li>
    ) : (
      <li className={p === page ? styles.Selected : ""} key={p}>
        <Link href={p === 1 ? slug : `${slug}?page=${p}`}>
          <a className="no-select" onClick={() => paginate(p)}>
            {p}
          </a>
        </Link>
      </li>
    );
  };

  return (
    <nav>
      <ul className={styles.Pages}>
        <li className={page === 1 ? styles.Disabled : ""} key={"back"}>
          {page > 1 && (
            <Link href={page === 2 ? slug : `${slug}?page=${page - 1}`}>
              <a className="no-select">{"<"}</a>
            </Link>
          )}
          {page === 1 && "<"}
        </li>
        {pageNumbers.length > 5 && (
          <>
            {[...Array(2)].map((x, i) => button(i + 1))}
            <li key={3}>...</li>
            {[...Array(2)].map((x, i) => button(pageNumbers.length - 1 + i))}
          </>
        )}
        {pageNumbers.length <= 5 &&
          [...Array(pageNumbers.length)].map((x, i) => button(i + 1))}
        <li
          className={
            page === pageNumbers.length ? styles.Disabled : styles.Forward
          }
          key={"forward"}
        >
          {page < pageNumbers.length && (
            <Link href={`${slug}?page=${page + 1}`}>
              <a className="no-select">{">"}</a>
            </Link>
          )}
          {page === pageNumbers.length && ">"}
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
