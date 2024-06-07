--
-- PostgreSQL database dump
--

-- Dumped from database version 12.17
-- Dumped by pg_dump version 12.17

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: qbe_companymaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_companymaster (
    id integer NOT NULL,
    sourceguid character varying(128) NOT NULL,
    compname character varying(256) NOT NULL,
    hoid integer,
    isho boolean,
    syncid character varying(128),
    hosyncid character varying(128),
    status smallint,
    productkey character varying(32),
    mobileappsubkey character varying(32),
    enddate date,
    activeflag smallint,
    hoguid text,
    addressline1 text,
    addressline2 text,
    addressline3 text,
    city text,
    state text,
    country text,
    pincode text,
    gstin text,
    mobileappname text,
    mobileapplogo bytea,
    service_area json,
    config json
);


ALTER TABLE public.qbe_companymaster OWNER TO postgres;

--
-- Name: qbe_companymaster_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_companymaster_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_companymaster_id_seq OWNER TO postgres;

--
-- Name: qbe_companymaster_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_companymaster_id_seq OWNED BY public.qbe_companymaster.id;


--
-- Name: qbe_itemmaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_itemmaster (
    id integer NOT NULL,
    hoid integer NOT NULL,
    sourceid text NOT NULL,
    stocknumber text NOT NULL,
    itemdescription text,
    class1guid text,
    class2guid text,
    class3guid text,
    class4guid text,
    class5guid text,
    uom text,
    alias1 text,
    alias2 text,
    alias3 text,
    alias4 text,
    alias5 text,
    activeflag smallint NOT NULL,
    flag smallint NOT NULL,
    mrpmasterguid text,
    pricemasterguid text,
    mrp numeric,
    item_rate numeric,
    image text,
    class1image text,
    class2image text,
    itemguid text
);


ALTER TABLE public.qbe_itemmaster OWNER TO postgres;

--
-- Name: qbe_itemmaster_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_itemmaster_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_itemmaster_id_seq OWNER TO postgres;

--
-- Name: qbe_itemmaster_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_itemmaster_id_seq OWNED BY public.qbe_itemmaster.id;


--
-- Name: qbe_itemwishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_itemwishlist (
    id integer NOT NULL,
    hoid integer NOT NULL,
    sourceid text NOT NULL,
    stocknumber text NOT NULL,
    pid integer,
    addressid integer
);


ALTER TABLE public.qbe_itemwishlist OWNER TO postgres;

--
-- Name: qbe_itemwishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_itemwishlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_itemwishlist_id_seq OWNER TO postgres;

--
-- Name: qbe_itemwishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_itemwishlist_id_seq OWNED BY public.qbe_itemwishlist.id;


--
-- Name: qbe_party; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_party (
    pid integer NOT NULL,
    hoid integer NOT NULL,
    partyguid text,
    firstname text,
    lastname text,
    sourceguid text,
    mobno text NOT NULL,
    emailid text,
    password text
);


ALTER TABLE public.qbe_party OWNER TO postgres;

--
-- Name: qbe_party_pid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_party_pid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_party_pid_seq OWNER TO postgres;

--
-- Name: qbe_party_pid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_party_pid_seq OWNED BY public.qbe_party.pid;


--
-- Name: qbe_partyaddress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_partyaddress (
    addressid integer NOT NULL,
    hoid integer NOT NULL,
    linkid integer,
    lat double precision,
    lng double precision,
    sourceguid text,
    mobno text,
    addressline1 text,
    addressline2 text,
    addressline3 text,
    area text,
    city text,
    state text,
    country text,
    alias text,
    pincode text,
    isactive boolean
);


ALTER TABLE public.qbe_partyaddress OWNER TO postgres;

--
-- Name: qbe_partyaddress_addressid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_partyaddress_addressid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_partyaddress_addressid_seq OWNER TO postgres;

--
-- Name: qbe_partyaddress_addressid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_partyaddress_addressid_seq OWNED BY public.qbe_partyaddress.addressid;


--
-- Name: qbe_stockbalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_stockbalance (
    id integer NOT NULL,
    hoid integer,
    ctr integer,
    closingbalqty numeric,
    second_uomqty numeric,
    sourceguid text,
    mrpmasterguid text,
    batchno text,
    locationcode text,
    priceguid text,
    closingbal_uomguid text,
    second_uomguid text,
    active_flag smallint DEFAULT 1,
    srcid integer
);


ALTER TABLE public.qbe_stockbalance OWNER TO postgres;

--
-- Name: qbe_stockbalance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_stockbalance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_stockbalance_id_seq OWNER TO postgres;

--
-- Name: qbe_stockbalance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_stockbalance_id_seq OWNED BY public.qbe_stockbalance.id;


--
-- Name: qbe_trn_dtls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_trn_dtls (
    dtl_id integer NOT NULL,
    order_hdr_guid integer,
    hoid integer NOT NULL,
    sl_no integer,
    itemguid integer,
    trans_qty numeric,
    item_rate numeric,
    item_value numeric,
    disc_perc numeric,
    disc_amt numeric,
    disc_flag smallint,
    item_net_value numeric,
    active_flag smallint,
    flag smallint DEFAULT 0,
    sourceguid text,
    batchno text,
    mrpmasterguid text,
    pricemasterguid text,
    uom text,
    disc_guid text,
    vchtype text,
    vchtypeguid text,
    srcid integer
);


ALTER TABLE public.qbe_trn_dtls OWNER TO postgres;

--
-- Name: qbe_trn_dtls_dtl_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_trn_dtls_dtl_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_trn_dtls_dtl_id_seq OWNER TO postgres;

--
-- Name: qbe_trn_dtls_dtl_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_trn_dtls_dtl_id_seq OWNED BY public.qbe_trn_dtls.dtl_id;


--
-- Name: qbe_trn_hdr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_trn_hdr (
    hdr_id integer NOT NULL,
    partyguid integer,
    partyaddressguid integer,
    hoid integer NOT NULL,
    vch_date date,
    invoice_date date,
    tot_qty numeric,
    tot_value numeric,
    tot_disc numeric,
    tot_itemlevel_disc numeric,
    net_bill_value numeric,
    exp_del_date date,
    order_creation_datetime timestamp without time zone,
    activeflag smallint,
    flag smallint DEFAULT 0,
    sourceguid text,
    vchtype text,
    vchtypeguid text,
    vch_no text,
    order_status text,
    remarks text,
    addl_remarks text,
    invoiceno text,
    srcid integer,
    invrefid text
);


ALTER TABLE public.qbe_trn_hdr OWNER TO postgres;

--
-- Name: qbe_trn_hdr_hdr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_trn_hdr_hdr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_trn_hdr_hdr_id_seq OWNER TO postgres;

--
-- Name: qbe_trn_hdr_hdr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_trn_hdr_hdr_id_seq OWNED BY public.qbe_trn_hdr.hdr_id;


--
-- Name: qbe_vch_control; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qbe_vch_control (
    cid integer NOT NULL,
    sourceguid text,
    hoid integer,
    control_no integer DEFAULT 1,
    active_flag smallint DEFAULT 1
);


ALTER TABLE public.qbe_vch_control OWNER TO postgres;

--
-- Name: qbe_vch_control_cid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qbe_vch_control_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.qbe_vch_control_cid_seq OWNER TO postgres;

--
-- Name: qbe_vch_control_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qbe_vch_control_cid_seq OWNED BY public.qbe_vch_control.cid;


--
-- Name: qbe_companymaster id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_companymaster ALTER COLUMN id SET DEFAULT nextval('public.qbe_companymaster_id_seq'::regclass);


--
-- Name: qbe_itemmaster id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_itemmaster ALTER COLUMN id SET DEFAULT nextval('public.qbe_itemmaster_id_seq'::regclass);


--
-- Name: qbe_itemwishlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_itemwishlist ALTER COLUMN id SET DEFAULT nextval('public.qbe_itemwishlist_id_seq'::regclass);


--
-- Name: qbe_party pid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_party ALTER COLUMN pid SET DEFAULT nextval('public.qbe_party_pid_seq'::regclass);


--
-- Name: qbe_partyaddress addressid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_partyaddress ALTER COLUMN addressid SET DEFAULT nextval('public.qbe_partyaddress_addressid_seq'::regclass);


--
-- Name: qbe_stockbalance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_stockbalance ALTER COLUMN id SET DEFAULT nextval('public.qbe_stockbalance_id_seq'::regclass);


--
-- Name: qbe_trn_dtls dtl_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_dtls ALTER COLUMN dtl_id SET DEFAULT nextval('public.qbe_trn_dtls_dtl_id_seq'::regclass);


--
-- Name: qbe_trn_hdr hdr_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_hdr ALTER COLUMN hdr_id SET DEFAULT nextval('public.qbe_trn_hdr_hdr_id_seq'::regclass);


--
-- Name: qbe_vch_control cid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_vch_control ALTER COLUMN cid SET DEFAULT nextval('public.qbe_vch_control_cid_seq'::regclass);


--
-- Name: qbe_companymaster qbe_companymaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_companymaster
    ADD CONSTRAINT qbe_companymaster_pkey PRIMARY KEY (id);


--
-- Name: qbe_itemmaster qbe_itemmaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_itemmaster
    ADD CONSTRAINT qbe_itemmaster_pkey PRIMARY KEY (id);


--
-- Name: qbe_itemwishlist qbe_itemwishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_itemwishlist
    ADD CONSTRAINT qbe_itemwishlist_pkey PRIMARY KEY (id);


--
-- Name: qbe_party qbe_party_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_party
    ADD CONSTRAINT qbe_party_pkey PRIMARY KEY (pid);


--
-- Name: qbe_partyaddress qbe_partyaddress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_partyaddress
    ADD CONSTRAINT qbe_partyaddress_pkey PRIMARY KEY (addressid);


--
-- Name: qbe_stockbalance qbe_stockbalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_stockbalance
    ADD CONSTRAINT qbe_stockbalance_pkey PRIMARY KEY (id);


--
-- Name: qbe_trn_dtls qbe_trn_dtls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_dtls
    ADD CONSTRAINT qbe_trn_dtls_pkey PRIMARY KEY (dtl_id);


--
-- Name: qbe_trn_hdr qbe_trn_hdr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_hdr
    ADD CONSTRAINT qbe_trn_hdr_pkey PRIMARY KEY (hdr_id);


--
-- Name: qbe_vch_control qbe_vch_control_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_vch_control
    ADD CONSTRAINT qbe_vch_control_pkey PRIMARY KEY (cid);


--
-- Name: qbe_party unique_hoid_mobno_p; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_party
    ADD CONSTRAINT unique_hoid_mobno_p UNIQUE (hoid, mobno);


--
-- Name: qbe_itemwishlist unique_hoid_sourceid_stocknumber; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_itemwishlist
    ADD CONSTRAINT unique_hoid_sourceid_stocknumber UNIQUE (hoid, sourceid, stocknumber);


--
-- Name: qbe_itemmaster unique_mrpguid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_itemmaster
    ADD CONSTRAINT unique_mrpguid UNIQUE (mrpmasterguid);


--
-- Name: qbe_stockbalance unique_source_item; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_stockbalance
    ADD CONSTRAINT unique_source_item UNIQUE (sourceguid, mrpmasterguid);


--
-- Name: qbe_companymaster unique_sourceguid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_companymaster
    ADD CONSTRAINT unique_sourceguid UNIQUE (sourceguid);


--
-- Name: qbe_stockbalance unique_srcid_mrpmasterguid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_stockbalance
    ADD CONSTRAINT unique_srcid_mrpmasterguid UNIQUE (srcid, mrpmasterguid);


--
-- Name: qbe_partyaddress fk_qbe_partyaddress_qbe_party; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_partyaddress
    ADD CONSTRAINT fk_qbe_partyaddress_qbe_party FOREIGN KEY (linkid) REFERENCES public.qbe_party(pid);


--
-- Name: qbe_trn_dtls qbe_trn_dtls_itemguid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_dtls
    ADD CONSTRAINT qbe_trn_dtls_itemguid_fkey FOREIGN KEY (itemguid) REFERENCES public.qbe_itemmaster(id);


--
-- Name: qbe_trn_dtls qbe_trn_dtls_order_hdr_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_dtls
    ADD CONSTRAINT qbe_trn_dtls_order_hdr_guid_fkey FOREIGN KEY (order_hdr_guid) REFERENCES public.qbe_trn_hdr(hdr_id);


--
-- Name: qbe_trn_hdr qbe_trn_hdr_partyguid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qbe_trn_hdr
    ADD CONSTRAINT qbe_trn_hdr_partyguid_fkey FOREIGN KEY (partyguid) REFERENCES public.qbe_party(pid);


--
-- PostgreSQL database dump complete
--

