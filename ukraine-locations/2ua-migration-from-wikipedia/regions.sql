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
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (2, 'Харьковская область', 'Харківська область', 'Kharkiv region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (3, 'Одесская область', 'Одеська область', 'Odessa region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (4, 'Днепропетровская область', 'Дніпропетровська область', 'Dnipropetrovsk region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (5, 'Донецкая область', 'Донецька область', 'Donetsk region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (6, 'Запорожская область', 'Запорізька область', 'Zaporizhzhia region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (7, 'Львовская область', 'Львівська область', 'Lviv region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (8, 'Николаевская область', 'Миколаївська область', 'Mykolaiv region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (9, 'Севастополь', 'Севастополь', 'Sevastopol', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (10, 'Луганская область', 'Луганська область', 'Luhansk region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (11, 'Винницкая область', 'Вінницька область', 'Vinnytsia region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (12, 'Автономная Республика Крым', 'Автономна Республіка Крим', 'Autonomous Republic of Crimea', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (13, 'Херсонская область', 'Херсонська область', 'Kherson region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (14, 'Черниговская область', 'Чернігівська область', 'Chernihiv region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (15, 'Полтавская область', 'Полтавська область', 'Poltava region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (16, 'Черкасская область', 'Черкаська область', 'Cherkasy region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (17, 'Хмельницкая область', 'Хмельницька область', 'Khmelnytskyi region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (18, 'Черновицкая область', 'Чернівецька область', 'Chernivtsi region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (19, 'Житомирская область', 'Житомирська область', 'Zhytomyr region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (20, 'Сумская область', 'Сумська область', 'Sumy region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (21, 'Ровненская область', 'Рівненська область', 'Rivne region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (22, 'Ивано-Франковская область', 'Івано-Франківська область', 'Ivano-Frankivsk region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (23, 'Кировоградская область', 'Кіровоградська область', 'Kirovohrad region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (24, 'Тернопольская область', 'Тернопільська область', 'Ternopil region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (25, 'Волынская область', 'Волинська область', 'Volyn region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (26, 'Киевская область', 'Київська область', 'Kyiv region', 1, '2022-05-15 00:00:00');
INSERT INTO public.regions (id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES (27, 'Закарпатская область', 'Закарпатська область', 'Zakarpattia region', 1, '2022-05-15 00:00:00');


--
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.regions_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

