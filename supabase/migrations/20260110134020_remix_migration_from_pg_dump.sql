CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'student',
    'teacher',
    'librarian'
);


--
-- Name: book_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.book_status AS ENUM (
    'available',
    'issued',
    'reserved',
    'maintenance'
);


--
-- Name: borrowing_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.borrowing_status AS ENUM (
    'borrowed',
    'returned',
    'overdue'
);


--
-- Name: challenge_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.challenge_status AS ENUM (
    'active',
    'completed',
    'cancelled'
);


--
-- Name: challenge_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.challenge_type AS ENUM (
    'book_count',
    'genre_exploration',
    'time_based',
    'class_competition',
    'house_competition'
);


--
-- Name: review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: suggestion_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.suggestion_status AS ENUM (
    'pending',
    'reviewed',
    'approved',
    'acquired',
    'rejected'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    -- Default role is student
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
    
    RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    author text NOT NULL,
    isbn text,
    description text,
    cover_image_url text,
    page_count integer,
    publisher text,
    publication_year integer,
    category_id uuid,
    genre_id uuid,
    status public.book_status DEFAULT 'available'::public.book_status NOT NULL,
    total_copies integer DEFAULT 1 NOT NULL,
    available_copies integer DEFAULT 1 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    featured_until timestamp with time zone,
    added_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: borrowing_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.borrowing_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    book_id uuid NOT NULL,
    user_id uuid NOT NULL,
    borrowed_at timestamp with time zone DEFAULT now() NOT NULL,
    due_date timestamp with time zone NOT NULL,
    returned_at timestamp with time zone,
    status public.borrowing_status DEFAULT 'borrowed'::public.borrowing_status NOT NULL,
    issued_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: challenge_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_id uuid NOT NULL,
    user_id uuid NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    challenge_type public.challenge_type NOT NULL,
    target_count integer,
    target_genre_id uuid,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status public.challenge_status DEFAULT 'active'::public.challenge_status NOT NULL,
    target_class text,
    target_house text,
    badge_name text,
    badge_icon text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    location text,
    image_url text,
    is_past boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    book_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: featured_archive; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.featured_archive (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    book_id uuid NOT NULL,
    featured_from timestamp with time zone NOT NULL,
    featured_until timestamp with time zone NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    message text NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    reviewed boolean DEFAULT false NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text,
    is_pinned boolean DEFAULT false NOT NULL,
    image_url text,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: online_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    resource_type text NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    class_name text,
    house_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reader_spotlights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reader_spotlights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    spotlight_type text NOT NULL,
    period text NOT NULL,
    books_read integer DEFAULT 0 NOT NULL,
    featured_from timestamp with time zone NOT NULL,
    featured_until timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reading_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_list (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    book_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    book_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    review_text text,
    status public.review_status DEFAULT 'pending'::public.review_status NOT NULL,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    book_title text NOT NULL,
    author text,
    reason text,
    status public.suggestion_status DEFAULT 'pending'::public.suggestion_status NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_name text NOT NULL,
    badge_icon text,
    challenge_id uuid,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'student'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: borrowing_records borrowing_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowing_records
    ADD CONSTRAINT borrowing_records_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: challenge_participants challenge_participants_challenge_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_challenge_id_user_id_key UNIQUE (challenge_id, user_id);


--
-- Name: challenge_participants challenge_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_book_id_key UNIQUE (user_id, book_id);


--
-- Name: featured_archive featured_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_archive
    ADD CONSTRAINT featured_archive_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: online_resources online_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_resources
    ADD CONSTRAINT online_resources_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: reader_spotlights reader_spotlights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reader_spotlights
    ADD CONSTRAINT reader_spotlights_pkey PRIMARY KEY (id);


--
-- Name: reading_list reading_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list
    ADD CONSTRAINT reading_list_pkey PRIMARY KEY (id);


--
-- Name: reading_list reading_list_user_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list
    ADD CONSTRAINT reading_list_user_id_book_id_key UNIQUE (user_id, book_id);


--
-- Name: reviews reviews_book_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_book_id_user_id_key UNIQUE (book_id, user_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: borrowing_records update_borrowing_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_borrowing_records_updated_at BEFORE UPDATE ON public.borrowing_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: challenges update_challenges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: news update_news_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: online_resources update_online_resources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_online_resources_updated_at BEFORE UPDATE ON public.online_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: books books_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: books books_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: books books_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE SET NULL;


--
-- Name: borrowing_records borrowing_records_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowing_records
    ADD CONSTRAINT borrowing_records_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: borrowing_records borrowing_records_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowing_records
    ADD CONSTRAINT borrowing_records_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: borrowing_records borrowing_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowing_records
    ADD CONSTRAINT borrowing_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenge_participants challenge_participants_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: challenge_participants challenge_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenges challenges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: challenges challenges_target_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_target_genre_id_fkey FOREIGN KEY (target_genre_id) REFERENCES public.genres(id) ON DELETE SET NULL;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: favorites favorites_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: featured_archive featured_archive_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_archive
    ADD CONSTRAINT featured_archive_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: news news_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: online_resources online_resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_resources
    ADD CONSTRAINT online_resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reader_spotlights reader_spotlights_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reader_spotlights
    ADD CONSTRAINT reader_spotlights_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reading_list reading_list_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list
    ADD CONSTRAINT reading_list_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: reading_list reading_list_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list
    ADD CONSTRAINT reading_list_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: suggestions suggestions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: suggestions suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE SET NULL;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reviews Approved reviews are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews FOR SELECT USING (((status = 'approved'::public.review_status) OR (user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: books Books are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);


--
-- Name: categories Categories are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);


--
-- Name: challenges Challenges are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);


--
-- Name: events Events are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);


--
-- Name: featured_archive Featured archive is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Featured archive is viewable by everyone" ON public.featured_archive FOR SELECT USING (true);


--
-- Name: genres Genres are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Genres are viewable by everyone" ON public.genres FOR SELECT USING (true);


--
-- Name: reviews Librarians can delete reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: user_badges Librarians can manage badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage badges" ON public.user_badges TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: books Librarians can manage books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage books" ON public.books TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: borrowing_records Librarians can manage borrowing records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage borrowing records" ON public.borrowing_records TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: categories Librarians can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage categories" ON public.categories TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: events Librarians can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage events" ON public.events TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: featured_archive Librarians can manage featured archive; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage featured archive" ON public.featured_archive TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: feedback Librarians can manage feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage feedback" ON public.feedback FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: genres Librarians can manage genres; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage genres" ON public.genres TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: news Librarians can manage news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage news" ON public.news TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: online_resources Librarians can manage resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage resources" ON public.online_resources TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: user_roles Librarians can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: reader_spotlights Librarians can manage spotlights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage spotlights" ON public.reader_spotlights TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: suggestions Librarians can manage suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can manage suggestions" ON public.suggestions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: user_roles Librarians can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Librarians can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'librarian'::public.app_role));


--
-- Name: news News is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "News is viewable by everyone" ON public.news FOR SELECT USING (true);


--
-- Name: challenge_participants Participants can view their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can view their own progress" ON public.challenge_participants FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role) OR public.has_role(auth.uid(), 'teacher'::public.app_role)));


--
-- Name: profiles Profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: online_resources Resources are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Resources are viewable by everyone" ON public.online_resources FOR SELECT USING ((is_active = true));


--
-- Name: reader_spotlights Spotlights are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Spotlights are viewable by everyone" ON public.reader_spotlights FOR SELECT USING (true);


--
-- Name: challenges Teachers and librarians can manage challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers and librarians can manage challenges" ON public.challenges TO authenticated USING ((public.has_role(auth.uid(), 'librarian'::public.app_role) OR public.has_role(auth.uid(), 'teacher'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'librarian'::public.app_role) OR public.has_role(auth.uid(), 'teacher'::public.app_role)));


--
-- Name: feedback Users can create feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) OR (is_anonymous = true)));


--
-- Name: suggestions Users can create suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create suggestions" ON public.suggestions FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: reviews Users can create their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: challenge_participants Users can join challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: favorites Users can manage their own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own favorites" ON public.favorites TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: reading_list Users can manage their own reading list; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own reading list" ON public.reading_list TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: challenge_participants Users can update their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own progress" ON public.challenge_participants FOR UPDATE TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: reviews Users can update their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: user_badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: borrowing_records Users can view their own borrowing records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own borrowing records" ON public.borrowing_records FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: feedback Users can view their own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: suggestions Users can view their own suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own suggestions" ON public.suggestions FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'librarian'::public.app_role)));


--
-- Name: books; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

--
-- Name: borrowing_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.borrowing_records ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: featured_archive; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.featured_archive ENABLE ROW LEVEL SECURITY;

--
-- Name: feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: genres; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

--
-- Name: news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

--
-- Name: online_resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.online_resources ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reader_spotlights; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reader_spotlights ENABLE ROW LEVEL SECURITY;

--
-- Name: reading_list; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;