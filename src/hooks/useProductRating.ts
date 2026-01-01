import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import logger from "../lib/logger";

export function useProductRating(productId: number | undefined) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchRating() {
      try {
        const [avgResult, countResult] = await Promise.all([
          supabase.rpc("get_product_average_rating", { p_id: productId }),
          supabase.rpc("get_product_review_count", { p_id: productId }),
        ]);

        if (isMounted) {
          if (avgResult.error) throw avgResult.error;
          if (countResult.error) throw countResult.error;

          setRating(avgResult.data || 0);
          setCount(countResult.data || 0);
        }
      } catch (err) {
        logger.error(`Error fetching rating for product ${productId}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRating();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  return { rating, count, loading };
}
