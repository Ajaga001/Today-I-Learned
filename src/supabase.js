import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://kubxnofcxbwwdofwcurx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1Ynhub2ZjeGJ3d2RvZndjdXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjMxODgsImV4cCI6MjA3OTg5OTE4OH0.du4Qz-wJNIwu9L38Rc-HSS3EZ_tISgRdZx0_TaAIxA0";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
