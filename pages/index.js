import styles from "../styles/Home.module.css";
import cheerio from "cheerio";
import axios from "axios";
import Head from "next/head";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  TablePagination,
} from "@mui/material";

export default function Home(props) {
  function truncateString(str) {
    return str.slice(0, 300) + "...";
  }

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [length, setLength] = React.useState(props.rss.length);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rss = props.rss.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <>
      <Head>
        <title>Full-time Postings</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="UTF-8" />
        <meta name="description" content="Full-time postings RSS" />
        <meta name="language" content="en" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <Typography className={styles.header} variant="h3">
        Full-time Postings
      </Typography>
      <div className={styles.container}>
        {rss.map((data) => {
          return (
            <div className={styles.rssContainer} key={data.guid}>
              <Card style={{ border: "3px solid rgb(223, 132, 47)" }}>
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {data.title}
                  </Typography>
                  <Typography variant="body1">
                    {truncateString(data.description)}
                  </Typography>
                  <br />
                  <Typography variant="subtitle2">{data.pubDate}</Typography>
                </CardContent>
                <CardActions>
                  <a href={data.link} target="_blank" rel="noreferrer noopener">
                    <Button size="small">More Info</Button>
                  </a>
                </CardActions>
              </Card>
            </div>
          );
        })}
      </div>
      <div>
        <TablePagination
          rowsPerPageOptions={[12, 25, 50, 100]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          component="div"
          count={length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
      <footer className={styles.footer}>
        <Typography variant="subtitle2">
          &copy; COPYRIGHT 2021{" "}
          <a
            style={{ textDecoration: "underline" }}
            rel="noreferrer noopener"
            target="_blank"
            href="https://www.csi.cuny.edu/campus-life/student-services/center-career-and-professional-development"
          >
            Career Center
          </a>
          {"  "}&{"  "}
          <a
            href="https://andreahabib.netlify.app/"
            target="_blank"
            rel="noreferrer noopener"
            style={{ textDecoration: "underline" }}
          >
            Andrea Habib
          </a>
        </Typography>
      </footer>
    </>
  );
}

export async function getStaticProps() {
  const { data } = await axios.get(
    "https://csicuny.joinhandshake.com/external_feeds/11967/public.rss?token=wUE72YZnQQM8ItFouAUG97hf-ZMwEX_DKe5OjrTdLvcT3QyAP1QEKg"
  );
  const $ = cheerio.load(data);
  const rss = [];
  let allItems = {};
  const items = $("item");
  items.each(function (idx, el) {
    allItems["title"] = $(el).find("title").text();
    allItems["guid"] = $(el).find("guid").text();
    allItems["description"] = $(el).find("description").text();
    allItems["pubDate"] = $(el).find("pubDate").text();
    allItems["link"] = $(el).find("link")["0"].prev.next.next.data.slice(0, -7);
    rss.push(allItems);
    allItems = {};
  });
  return {
    props: { rss },
    revalidate: 86400,
  };
}
