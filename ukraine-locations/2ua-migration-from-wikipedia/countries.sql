--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2 (Debian 14.2-1.pgdg110+1)
-- Dumped by pg_dump version 14.2 (Debian 14.2-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.countries (id, title_ru, title_ua, title_en, created_date_time) VALUES (1, 'Украина', 'Україна', 'Ukraine', '2022-05-14 00:00:00');


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.countries_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

