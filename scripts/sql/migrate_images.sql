-- Migration script to update product images to local filenames

UPDATE public.products SET image = 'summit-2-person-tent-34.jpg', images = ARRAY['summit-2-person-tent-34.jpg'] WHERE id = 34;
UPDATE public.products SET image = 'tower-of-fun-cat-tree-36.jpg', images = ARRAY['tower-of-fun-cat-tree-36.jpg'] WHERE id = 36;
UPDATE public.products SET image = 'aviator-classic-sunglasses-40.jpg', images = ARRAY['aviator-classic-sunglasses-40.jpg'] WHERE id = 40;
UPDATE public.products SET image = 'acrylic-paint-set-39.jpg', images = ARRAY['acrylic-paint-set-39.jpg'] WHERE id = 39;
UPDATE public.products SET image = 'organic-cotton-t-shirt-12.jpg', images = ARRAY['organic-cotton-t-shirt-12.jpg'] WHERE id = 12;
UPDATE public.products SET image = 'mechanical-gaming-keyboard-15.jpg', images = ARRAY['mechanical-gaming-keyboard-15.jpg'] WHERE id = 15;
UPDATE public.products SET image = 'vintage-leather-camera-bag-14.jpg', images = ARRAY['vintage-leather-camera-bag-14.jpg'] WHERE id = 14;
UPDATE public.products SET image = 'eco-grip-yoga-mat-45.jpg', images = ARRAY['eco-grip-yoga-mat-45.jpg'] WHERE id = 45;
UPDATE public.products SET image = 'mesh-back-task-chair-47.jpg', images = ARRAY['mesh-back-task-chair-47.jpg'] WHERE id = 47;
UPDATE public.products SET image = 'insulated-steel-bottle-48.jpg', images = ARRAY['insulated-steel-bottle-48.jpg'] WHERE id = 48;
UPDATE public.products SET image = 'premium-wireless-headphones-28.jpg', images = ARRAY['premium-wireless-headphones-28.jpg'] WHERE id = 28;
UPDATE public.products SET image = 'smart-coffee-maker-29.jpg', images = ARRAY['smart-coffee-maker-29.jpg'] WHERE id = 29;
UPDATE public.products SET image = 'ceramic-planter-pot-51.jpg', images = ARRAY['ceramic-planter-pot-51.jpg'] WHERE id = 51;
UPDATE public.products SET image = 'strategy-master-board-game-52.jpg', images = ARRAY['strategy-master-board-game-52.jpg'] WHERE id = 52;
UPDATE public.products SET image = 'sonic-clean-toothbrush-53.jpg', images = ARRAY['sonic-clean-toothbrush-53.jpg'] WHERE id = 53;
