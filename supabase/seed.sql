SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict E8h7yBHj4HWgcNSZH7bSNONAHmUjVjk6kVV6h4wN356tZkjU1BQPq09UrkBVcGI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '2dc89deb-6c31-44c8-ab4a-ead98c28ac0b', '{"action":"login","actor_id":"9da600a0-9286-415c-bf65-c2691675c778","actor_name":"Michael J Miller","actor_username":"michael.joseph.miller@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-01 21:37:18.67744+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd6e147e-d03c-48ce-9e6b-c8c8202dfb89', '{"action":"token_refreshed","actor_id":"9da600a0-9286-415c-bf65-c2691675c778","actor_name":"Michael J Miller","actor_username":"michael.joseph.miller@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-01-01 22:36:25.17902+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b05e2f6-3861-4776-a5ea-78e39f0b02b3', '{"action":"token_revoked","actor_id":"9da600a0-9286-415c-bf65-c2691675c778","actor_name":"Michael J Miller","actor_username":"michael.joseph.miller@gmail.com","actor_via_sso":false,"log_type":"token"}', '2026-01-01 22:36:25.181232+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'b8fc3e8b-04af-4d14-b7ae-41eaa1456140', 'authenticated', 'authenticated', 'jsmith@gmail.com', '$2a$10$xWWwsCLScIbG8XPSindfH.d5dnf5T5csfNJsa5B7wDDJ5gKW84osC', '2025-12-28 18:27:34.429977+00', NULL, '73b63bc5c9f5058555d304b1e2682024a6b620116e481c508379b80f', '2025-12-28 15:32:14.779341+00', '', NULL, '', 'mjm091969@gmail.com', '2025-12-29 19:51:27.105265+00', '2025-12-29 19:50:32.782379+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b8fc3e8b-04af-4d14-b7ae-41eaa1456140", "email": "jsmith@gmail.com", "full_name": "Joe Smith", "email_verified": false, "phone_verified": false}', NULL, '2025-12-28 15:32:14.768129+00', '2025-12-29 19:52:17.873824+00', NULL, NULL, '', '', NULL, '771b16fedabfb88c65c7df46a8aee33da010fc5711937451917de858', 1, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '19c4f789-6c2e-48cd-96c2-781912c030a9', 'authenticated', 'authenticated', 'mjm091969@gmail.com', '$2a$10$6Y2pt7atMor9JpcPrspq6.XWROConqvEH0ZaB7kHXIiDpbLDJEIty', '2025-12-29 20:56:36.8105+00', NULL, '', '2025-12-29 20:56:27.829716+00', '', NULL, '', '', NULL, '2026-01-01 17:08:45.311229+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "19c4f789-6c2e-48cd-96c2-781912c030a9", "email": "mjm091969@gmail.com", "full_name": "mjm091969", "email_verified": true, "phone_verified": false}', NULL, '2025-12-29 20:56:27.786998+00', '2026-01-01 17:08:45.315094+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9da600a0-9286-415c-bf65-c2691675c778', 'authenticated', 'authenticated', 'michael.joseph.miller@gmail.com', '$2a$10$KQJChDSj9QC/XUGYh6q6wuFZPufmy1nP84cBnOpgHqxQ1IC739R0m', '2025-12-27 17:05:03.694053+00', NULL, '', '2025-12-27 17:04:31.610737+00', '', NULL, '', '', NULL, '2026-01-01 21:37:18.679728+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9da600a0-9286-415c-bf65-c2691675c778", "email": "michael.joseph.miller@gmail.com", "full_name": "Michael J Miller", "email_verified": true, "phone_verified": false}', NULL, '2025-12-27 17:04:31.553129+00', '2026-01-01 22:36:25.185554+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('9da600a0-9286-415c-bf65-c2691675c778', '9da600a0-9286-415c-bf65-c2691675c778', '{"sub": "9da600a0-9286-415c-bf65-c2691675c778", "email": "michael.joseph.miller@gmail.com", "full_name": "Michael J Miller", "email_verified": true, "phone_verified": false}', 'email', '2025-12-27 17:04:31.58961+00', '2025-12-27 17:04:31.590293+00', '2025-12-27 17:04:31.590293+00', '117c81bb-3435-4152-8284-ba8def410529'),
	('b8fc3e8b-04af-4d14-b7ae-41eaa1456140', 'b8fc3e8b-04af-4d14-b7ae-41eaa1456140', '{"sub": "b8fc3e8b-04af-4d14-b7ae-41eaa1456140", "email": "jsmith@gmail.com", "full_name": "Joe Smith", "email_verified": false, "phone_verified": false}', 'email', '2025-12-28 15:32:14.775137+00', '2025-12-28 15:32:14.7752+00', '2025-12-28 15:32:14.7752+00', '1799ea05-2b12-4f6a-8eec-35c41114bd0e'),
	('19c4f789-6c2e-48cd-96c2-781912c030a9', '19c4f789-6c2e-48cd-96c2-781912c030a9', '{"sub": "19c4f789-6c2e-48cd-96c2-781912c030a9", "email": "mjm091969@gmail.com", "full_name": "mjm091969", "email_verified": true, "phone_verified": false}', 'email', '2025-12-29 20:56:27.818392+00', '2025-12-29 20:56:27.818469+00', '2025-12-29 20:56:27.818469+00', 'f6a9f50f-5cbc-4716-b666-f5cc7b21bcf9');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('74ff52a6-3474-4f9e-92af-c56968568cd5', '9da600a0-9286-415c-bf65-c2691675c778', '2026-01-01 17:22:39.596919+00', '2026-01-01 20:42:23.790515+00', NULL, 'aal1', NULL, '2026-01-01 20:42:23.789166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '172.56.99.7', NULL, NULL, NULL, NULL, NULL),
	('a9fdd83f-fa97-4fff-99f2-772839c96d20', '9da600a0-9286-415c-bf65-c2691675c778', '2026-01-01 21:37:18.679844+00', '2026-01-01 22:36:25.18814+00', NULL, 'aal1', NULL, '2026-01-01 22:36:25.188068', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('74ff52a6-3474-4f9e-92af-c56968568cd5', '2026-01-01 17:22:39.684995+00', '2026-01-01 17:22:39.684995+00', 'password', '06962553-16db-487e-978b-437bbb7117df'),
	('a9fdd83f-fa97-4fff-99f2-772839c96d20', '2026-01-01 21:37:18.685749+00', '2026-01-01 21:37:18.685749+00', 'password', '5baa09a0-1d80-42e3-b697-b7cd7c150633');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('046b9671-6b56-44ed-9226-5447f853b32f', 'b8fc3e8b-04af-4d14-b7ae-41eaa1456140', 'confirmation_token', '73b63bc5c9f5058555d304b1e2682024a6b620116e481c508379b80f', 'jsmith@gmail.com', '2025-12-28 15:32:14.914644', '2025-12-28 15:32:14.914644'),
	('b691b1c8-c882-4e47-8399-cfa1a423fc7f', 'b8fc3e8b-04af-4d14-b7ae-41eaa1456140', 'email_change_token_current', '771b16fedabfb88c65c7df46a8aee33da010fc5711937451917de858', 'jsmith@gmail.com', '2025-12-29 19:51:27.390004', '2025-12-29 19:51:27.390004');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 112, 'meaenskemode', '9da600a0-9286-415c-bf65-c2691675c778', true, '2026-01-01 17:22:39.639981+00', '2026-01-01 18:21:18.530745+00', NULL, '74ff52a6-3474-4f9e-92af-c56968568cd5'),
	('00000000-0000-0000-0000-000000000000', 113, 'h2hdqzr3ybvu', '9da600a0-9286-415c-bf65-c2691675c778', true, '2026-01-01 18:21:18.557813+00', '2026-01-01 19:43:14.578444+00', 'meaenskemode', '74ff52a6-3474-4f9e-92af-c56968568cd5'),
	('00000000-0000-0000-0000-000000000000', 114, 'cbetnsa6aka3', '9da600a0-9286-415c-bf65-c2691675c778', true, '2026-01-01 19:43:14.597899+00', '2026-01-01 20:42:23.735918+00', 'h2hdqzr3ybvu', '74ff52a6-3474-4f9e-92af-c56968568cd5'),
	('00000000-0000-0000-0000-000000000000', 115, 'jczcxr6w4d2h', '9da600a0-9286-415c-bf65-c2691675c778', false, '2026-01-01 20:42:23.755757+00', '2026-01-01 20:42:23.755757+00', 'cbetnsa6aka3', '74ff52a6-3474-4f9e-92af-c56968568cd5'),
	('00000000-0000-0000-0000-000000000000', 116, '657ekvh663n5', '9da600a0-9286-415c-bf65-c2691675c778', true, '2026-01-01 21:37:18.681687+00', '2026-01-01 22:36:25.18212+00', NULL, 'a9fdd83f-fa97-4fff-99f2-772839c96d20'),
	('00000000-0000-0000-0000-000000000000', 117, 'o74iel7fzueg', '9da600a0-9286-415c-bf65-c2691675c778', false, '2026-01-01 22:36:25.183891+00', '2026-01-01 22:36:25.183891+00', '657ekvh663n5', 'a9fdd83f-fa97-4fff-99f2-772839c96d20');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "role", "full_name", "updated_at", "phone_number", "email", "email_verified") VALUES
	('19c4f789-6c2e-48cd-96c2-781912c030a9', 'customer', 'mjm091969', NULL, NULL, 'mjm091969@gmail.com', true),
	('9da600a0-9286-415c-bf65-c2691675c778', 'admin', 'Michael J Miller', '2025-12-29 19:36:40.707+00', '4074539385', 'michael.joseph.miller@gmail.com', true);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."addresses" ("id", "user_id", "address_line1", "address_line2", "city", "state", "zip_code", "country", "is_default", "created_at") VALUES
	('dc81fafe-77ca-42b4-8a1e-0afeb444569c', '9da600a0-9286-415c-bf65-c2691675c778', '419 Grapefruit Ave Apt 10B', '', 'Sebring', 'FL', '33870-3520', 'US', true, '2025-12-29 16:46:50.10722+00'),
	('589e6222-000a-4191-80cd-835e76cc03c5', '9da600a0-9286-415c-bf65-c2691675c778', '2734 E Oakwood Dr', '', 'Avon Park', 'FL', '33825-9692', 'US', false, '2025-12-29 19:34:25.794717+00'),
	('5ddb7dd8-1445-4752-bf3b-0f514a94bf3d', '19c4f789-6c2e-48cd-96c2-781912c030a9', '2734 E Oakwood Dr', '', 'Avon Park', 'FL', '33825-9692', 'US', true, '2025-12-29 20:58:06.20838+00');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."orders" ("id", "user_id", "status", "total_amount", "shipping_address", "created_at") VALUES
	(8, '9da600a0-9286-415c-bf65-c2691675c778', 'shipped', 59.99, '419 Grapefruit Ave Apt 10B, Sebring, FL 33870-3520', '2025-12-31 00:00:40.512348+00'),
	(7, '9da600a0-9286-415c-bf65-c2691675c778', 'shipped', 59.99, '2734 E Oakwood Dr, Avon Park, FL 33825-9692', '2025-12-30 23:57:37.713727+00'),
	(9, '19c4f789-6c2e-48cd-96c2-781912c030a9', 'shipped', 29.99, '2734 E Oakwood Dr, Avon Park, FL 33825-9692', '2026-01-01 17:06:42.78904+00');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "name", "price", "description", "image", "category", "on_hand", "images", "cost", "sku", "tags", "weight", "product_type", "brand", "gtin", "mpn", "condition", "status", "variant") VALUES
	(39, 'Acrylic Paint Set', 34.99, 'Complete set of 24 vibrant acrylic colors. perfect for beginners and professional artists alike.', '1767303667535_acrylic-paint-set-39.jpg', 'Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Kits', 40, '{1767303667535_acrylic-paint-set-39.jpg}', 12, 'ART-CRT-ACR', '{art,paint,acrylic,hobby}', 1, 'Arts & Crafts', 'CreativeSoul', NULL, 'CS-APS-24', 'new', 'active', NULL),
	(40, 'Aviator Classic Sunglasses', 149, 'Timeless aviator style sunglasses with polarized lenses for UV protection. Metal frame with comfortable nose pads.', '1767303734076_aviator-classic-sunglasses-40.jpg', 'Apparel & Accessories > Clothing Accessories > Sunglasses', 50, '{1767303734076_aviator-classic-sunglasses-40.jpg}', 55, 'SNG-SNS-AVT', '{sunglasses,fashion,accessories,summer}', 0.1, 'Accessories', 'SunShade', NULL, 'SS-AVI-CLS', 'new', 'active', NULL),
	(51, 'Ceramic Planter Pot', 19.99, 'Minimalist ceramic planter with drainage hole and saucer. Perfect for indoor plants and succulents.', '1767303783358_ceramic-planter-pot-51.jpg', 'Home & Garden > Lawn & Garden > Gardening > Pots & Planters', 75, '{1767303783358_ceramic-planter-pot-51.jpg}', 6.5, 'PTS-GRN-CRM', '{garden,planter,"home decor",indoor}', 0.8, 'Gardening', 'GreenThumb', NULL, 'GT-CPP-MED', 'new', 'active', NULL),
	(45, 'Eco Grip Yoga Mat', 45, 'Sustainable natural rubber yoga mat with superior grip and cushioning. Non-toxic and eco-friendly.', '1767303812124_eco-grip-yoga-mat-45.jpg', 'Sports & Outdoors > Exercise & Fitness > Yoga > Mats', 60, '{1767303812124_eco-grip-yoga-mat-45.jpg}', 18, 'MTS-ZNF-EC', '{yoga,fitness,eco-friendly,exercise}', 1.2, 'Fitness Accessories', 'ZenFlex', NULL, 'ZF-YM-ECO', 'new', 'active', NULL),
	(15, 'Mechanical Gaming Keyboard', 89.99, 'RGB backlit mechanical keyboard with blue switches. Certified refurbished with new keycaps.', '1767303854925_mechanical-gaming-keyboard-15.jpg', 'Electronics > Electronics Accessories > Computer Components > Input Devices > Keyboards', 8, '{1767303854925_mechanical-gaming-keyboard-15.jpg}', 40, 'KYB-MECH-RGB-REF', '{gaming,keyboard,rgb}', 1.2, 'Electronics', 'ClickyTech', NULL, 'CT-K100-REF', 'refurbished', 'active', NULL),
	(47, 'Mesh Back Task Chair', 199.99, 'Ergonomic office chair with breathable mesh back and adjustable lumbar support. Ideal for long work sessions.', '1767303872384_mesh-back-task-chair-47.jpg', 'Furniture > Office Furniture > Chairs > Task Chairs', 30, '{1767303872384_mesh-back-task-chair-47.jpg}', 90, 'CHR-ERG-MSH', '{office,furniture,chair,ergonomic}', 12, 'Furniture', 'ErgoWork', NULL, 'EW-MBC-001', 'new', 'active', NULL),
	(12, 'Organic Cotton T-Shirt', 25, 'Classic fit t-shirt made from 100% organic cotton. Pre-shrunk and durable.', '1767303898382_organic-cotton-t-shirt-12.jpg', 'Apparel & Accessories > Clothing > Shirts & Tops', 100, '{1767303898382_organic-cotton-t-shirt-12.jpg}', 8.5, 'TSHIRT-ORG-003', '{organic,cotton,clothing}', 0.3, 'Apparel', 'EcoWear', NULL, 'EW-TS003', 'new', 'active', NULL),
	(29, 'Smart Coffee Maker', 189.99, 'WiFi enabled coffee maker. Schedule your brew from your phone. (Currently Out of Stock)', '1767303940337_smart-coffee-maker-29.jpg', 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Coffee Makers & Espresso Machines', 0, '{1767303940337_smart-coffee-maker-29.jpg}', 95, 'COF-SMRT-005', '{coffee,"smart home",wifi}', 5, 'Home Appliance', 'BrewSmart', '00098765432101', 'BS-CM500', 'new', 'active', NULL),
	(53, 'Sonic Clean Toothbrush', 59.99, 'Advanced sonic technology for a deep clean. Rechargeable battery, 3 modes, and 2 minute timer.', '1767303962270_sonic-clean-toothbrush.png', 'Health & Beauty > Personal Care > Oral Care > Toothbrushes', 45, '{1767303962270_sonic-clean-toothbrush.png}', 25, 'TTH-SML-SNC', '{health,beauty,dental,toothbrush}', 0.3, 'Personal Care', 'SmileBright', NULL, 'SB-SCT-200', 'new', 'active', NULL),
	(52, 'Strategy Master Board Game', 29.99, 'A classic game of strategy and skill. Challenge your friends and family to a battle of wits.', '1767303981819_strategy-master-board-game-52.jpg', 'Toys & Games > Games > Board Games', 35, '{1767303981819_strategy-master-board-game-52.jpg}', 10, 'GMS-FML-STR', '{"board game",toys,family,strategy}', 1.5, 'Toys & Games', 'FamilyFun', NULL, 'FF-SMBG-01', 'new', 'active', NULL),
	(36, 'Tower of Fun Cat Tree', 129.99, 'Multi-level cat tree with scratching posts, hammocks, and condos. Keeps your feline friend entertained for hours.', '1767304021945_tower-of-fun-cat-tree-36.jpg', 'Animals & Pet Supplies > Cat Supplies > Cat Furniture > Cat Trees', 15, '{1767304021945_tower-of-fun-cat-tree-36.jpg}', 65, 'TRS-PRP-TOW', '{cat,pet,furniture,"scratching post"}', 15, 'Pet Supplies', 'PurrPalace', NULL, 'PP-CT-TOF', 'new', 'active', NULL),
	(14, 'Vintage Leather Camera Bag', 145, 'Handcrafted from genuine full-grain leather, this camera bag ages beautifully. Fits one DSLR body and two lenses.', '1767304041190_vintage-leather-camera-bag-14.jpg', 'Cameras & Optics > Camera & Optic Accessories > Camera Parts & Accessories > Camera Bags & Cases', 15, '{1767304041190_vintage-leather-camera-bag-14.jpg}', 60, 'CMRA-ARTLGCY-VNTLTHRBG-TAN', '{leather,camera,vintage}', 2.5, 'Accessories', 'ArtisanLegacy', NULL, 'AL-CB100', 'new', 'active', 'Tan'),
	(48, 'Insulated Steel Bottle', 24.99, 'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12.', '1767303829009_insulated-steel-bottle.png', 'Home & Garden > Kitchen & Dining > Food & Beverage Carriers > Water Bottles', 100, '{1767303829009_insulated-steel-bottle.png}', 8, 'WTR-HYD-INS', '{"water bottle",hydration,insulated,travel}', 0.4, 'Kitchenware', 'HydroFlow', NULL, 'HF-ISB-500', 'new', 'active', NULL),
	(28, 'Premium Wireless Headphones', 299.99, 'Experience crystal clear sound with our latest noise-cancelling headphones. Featuring 30-hour battery life and plush ear cushions for all-day comfort.', '1767303919806_premium-wireless-headphones-28.jpg', 'Electronics > Audio > Audio Components > Headphones & Headsets > Headphones', 50, '{1767303919806_premium-wireless-headphones-28.jpg}', 150, 'HDPH-NC-001', '{audio,wireless,headphones}', 0.8, 'Electronics', 'SoundMax', '00012345678905', 'SM-NC300', 'new', 'active', NULL),
	(34, 'Summit 2 Person Tent', 89.99, 'Lightweight and durable 2-person tent perfect for backpacking and camping. Features waterproof fly and easy setup.', '1767304002453_summit-2-person-tent-34.jpg', 'Sports & Outdoors > Outdoor Recreation > Camping & Hiking > Tents', 25, '{1767304002453_summit-2-person-tent-34.jpg}', 45, 'TNT-TRL-SMM', '{camping,outdoor,tent,hiking}', 2.5, 'Outdoor Gear', 'TrailBlazer', NULL, 'TB-TNT-2P', 'new', 'active', NULL);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order_items" ("id", "order_id", "user_id", "product_id", "product_name", "quantity", "price") VALUES
	(11, 7, '9da600a0-9286-415c-bf65-c2691675c778', 53, 'Sonic Clean Toothbrush', 1, 59.99),
	(12, 8, '9da600a0-9286-415c-bf65-c2691675c778', 53, 'Sonic Clean Toothbrush', 1, 59.99),
	(13, 9, '19c4f789-6c2e-48cd-96c2-781912c030a9', 52, 'Strategy Master Board Game', 1, 29.99);


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reviews" ("id", "user_id", "product_id", "order_id", "rating", "comment", "status", "created_at") VALUES
	(2, '9da600a0-9286-415c-bf65-c2691675c778', 53, 8, 5, 'Sample review: Excellent product!', 'approved', '2026-01-01 16:43:00.24343+00'),
	(1, '9da600a0-9286-415c-bf65-c2691675c778', 53, 7, 5, 'Sample review: Excellent product!', 'rejected', '2026-01-01 16:43:00.24343+00'),
	(3, '19c4f789-6c2e-48cd-96c2-781912c030a9', 52, 9, 3, 'test review
', 'approved', '2026-01-01 17:20:41.055407+00'),
	(4, '9da600a0-9286-415c-bf65-c2691675c778', 53, 8, 4, 'test review', 'rejected', '2026-01-01 17:24:12.76087+00');


--
-- Data for Name: store_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store_settings" ("id", "store_name", "support_email", "primary_color", "secondary_color", "logo_url", "updated_at", "colors_background_1", "colors_text", "colors_solid_button_labels", "colors_accent_1", "colors_accent_2", "gradient_background_1", "type_header_font", "type_body_font", "type_header_scale", "type_body_scale", "page_width", "spacing_grid_horizontal", "spacing_grid_vertical", "buttons_border_thickness", "buttons_opacity", "buttons_radius", "buttons_shadow_opacity", "buttons_shadow_horizontal_offset", "image_ratio", "show_secondary_image", "show_brand", "show_rating", "enable_quick_add", "social_facebook_link", "social_instagram_link", "social_youtube_link", "social_tiktok_link", "social_twitter_link", "social_pinterest_link", "social_snapchat_link", "social_tumblr_link", "social_vimeo_link", "favicon_url", "currency_code_enabled", "cart_type", "predictive_search_enabled", "colors_background_light", "colors_background_dark", "colors_text_light", "colors_text_dark", "social_github_link") VALUES
	(1, 'Open E-Commerce', 'support@open-e-commerce.com', '#2563eb', 'teal', 'logo.png', '2025-12-30 22:46:35.948492+00', '#FFFFFF', '#121212', '#FFFFFF', '#475569', '#64748b', '', 'Playfair Display', 'Roboto', 190, 150, 1000, 8, 8, 0, 100, 3, 0, 0, 'square', true, true, true, true, '', '', '', '', '', '', '', '', '', 'favicon.ico', false, 'notification', true, '#FFFFFF', '#09090b', '#121212', '#f8fafc', 'https://github.com/mjmiller41/open-e-commerce');


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 117, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."order_items_id_seq"', 13, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."orders_id_seq"', 9, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."products_id_seq"', 53, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."reviews_id_seq"', 4, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict E8h7yBHj4HWgcNSZH7bSNONAHmUjVjk6kVV6h4wN356tZkjU1BQPq09UrkBVcGI

RESET ALL;
