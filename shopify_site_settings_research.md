# **Comprehensive Analysis of User-Defined Site Settings in Shopify Architecture**

## **1\. Architectural Principles of Storefront Configuration**

The governance of a Shopify storefront’s aesthetic and functional identity is mediated through a sophisticated configuration layer that separates the codebase from the user experience. In the paradigm of Online Store 2.0 (OS 2.0), this separation is enforced through a rigid schema architecture that empowers merchants to manipulate the store’s design system—colors, typography, layout, and component behaviors—without direct interaction with HTML, CSS, or Liquid code. The definition, validation, and storage of these user-defined settings constitute the backbone of the theme’s extensibility and are the primary subject of this research report.

The central mechanism for this configuration is the settings_schema.json file, located within the config directory of any compliant theme. This file acts as a declarative blueprint, defining the taxonomy of inputs available to the merchant in the global Theme Editor. Unlike local section settings, which are scoped to individual instances of dynamic components, the settings defined in settings_schema.json are global in scope. They are accessible throughout the entire theme via the global settings Liquid object, ensuring that fundamental design decisions propagate consistently across all templates, from the homepage to the checkout.

This report provides an exhaustive analysis of these user-defined settings, utilizing the Dawn theme—Shopify’s reference implementation for OS 2.0—as the primary case study. The analysis explores the technical specifications of input types, the semantic logic of design systems (color schemes and typography scales), the spatial configuration of layouts, and the extension of these settings into the secure Checkout environment via the Checkout Branding API.

### **1.1 The Role of settings_schema.json**

The settings_schema.json file is strictly formatted as a JSON array containing objects.1 Each object represents a distinct category within the Theme Editor’s sidebar, grouping related settings to improve the merchant's workflow. The rigid syntax of this file is critical; formatting errors, such as trailing commas or mismatched braces, will prevent the theme from compiling or uploading.3

Attributes within this schema include name, which provides the category label, and settings, an array of input definitions that dictate the user interface controls. Additionally, this file houses the critical theme_info object, a metadata container that identifies the theme’s name, version, author, and documentation resources. This metadata is strictly validated by the platform, requiring specific attributes like theme_support_url to be present while prohibiting conflicting attributes.2

### **1.2 Data Persistence in settings_data.json**

While the schema defines the _potential_ configuration, the settings_data.json file persists the _actual_ state. When a merchant interacts with a setting—for instance, dragging a slider to increase font size or selecting a hex code for an accent color—the platform serializes this choice and updates settings_data.json. This file maintains the current state object, which maps setting IDs to their values, and a presets object, which allows the theme to store multiple pre-configured stylistic variations (e.g., "Default," "Craft," "Retro") within a single codebase.4

## ---

**2\. Taxonomy of Input Primitives**

The granularity of user control is determined by the specific input types available in the Shopify setting schema. These inputs function as the interface primitives, translating user intent into structured data that the Liquid rendering engine can interpret. We categorize these into Basic Inputs, which handle simple data types, and Specialized Inputs, which interact with platform resources or complex UI widgets.

### **2.1 Basic Input Settings**

Basic inputs form the foundational layer of configuration, handling strings, integers, and booleans. Although simple, their attributes allows for significant control over validation and user guidance.

#### **2.1.1 Text and Textarea**

The text input provides a single-line field for string data, while textarea offers a multi-line input suitable for longer content.

- **Attributes:** Both support id, label, default, and info (sidebar help text). Crucially, they support placeholder text, which appears only in the editor to guide the user but does not output to the theme unless a value is entered.6
- **Usage:** These are ubiquitous for settings such as social media handles, announcement bar messages, or copyright text in footers. In technical implementations, these strings are often passed through translation filters (| t) to ensure localization support.

#### **2.1.2 Number**

The number input restricts user entry to numerical values.

- **Attributes:** Beyond standard labels, this input does not strictly enforce min/max constraints in the UI in the same way a range slider does, relying instead on the merchant's input.
- **Usage:** Commonly used for pagination limits (e.g., "Products per page") or defining grid columns where a specific integer is required for Liquid loop calculations.6

#### **2.1.3 Range**

The range input is a slider control that provides immediate visual feedback and strict constraint enforcement.

- **Attributes:** It requires min and max values, and supports a step attribute (determining the increment) and a unit attribute (e.g., "px", "%", "sec").
- **Technical Implication:** The return value is a number. This is the preferred input for dimensional settings like font sizes, padding, opacity, and layout widths because it prevents invalid inputs (e.g., negative pixels) that could break the CSS layout.6

#### **2.1.4 Checkbox**

The checkbox input represents a boolean (true/false) toggle.

- **Usage:** This is the primary mechanism for conditional logic in themes. Settings like "Show vendor," "Enable sticky header," or "Show secondary image on hover" rely on checkboxes.
- **Liquid Logic:** In the template, these are accessed via conditional tags, e.g., {% if settings.show\_vendor %}.6

#### **2.1.5 Radio and Select**

These inputs allow selection from a predefined set of options.

- **Radio:** Displays all options visible as radio buttons. Best for short lists (2-4 options) where immediate comparison is necessary (e.g., Alignment: Left, Center, Right).
- **Select:** Renders a dropdown menu. Best for long lists of options to conserve screen real estate in the editor (e.g., selecting a date format or a button style preset).
- **Data Structure:** Both inputs require an options array, where each option has a value (passed to code) and a label (seen by user).6

### **2.2 Specialized Input Settings**

Specialized inputs provide rich interfaces for selecting platform resources or complex visual data.

#### **2.2.1 Image Picker**

The image_picker is perhaps the most visually impactful setting. It opens the native Shopify Files interface, allowing users to upload, select, or explore free stock images.

- **Return Object:** Unlike basic inputs that return strings, this returns an image object. This object exposes powerful Liquid attributes such as aspect_ratio, width, height, and allows the use of the image_url filter to generate responsive srcset attributes automatically.
- **Usage:** Essential for logos, favicons, banner backgrounds, and promotional tiles.7

#### **2.2.2 Product and Collection Pickers**

The product and collection inputs allow merchants to link specific inventory items to the theme settings.

- **Variants:** product_list and collection_list allow for the selection of multiple items, returning an array.
- **Usage:** These are critical for "Featured Collection" sections or "Recommended Products" sidebars. They establish a dynamic link; if the product data changes in the admin, the theme reflects those changes immediately without requiring theme editor updates.7

#### **2.2.3 Color and Gradient**

- **Color:** Renders a hex code picker with an opacity slider (RGBA). This is the fundamental unit of design system configuration.7
- **Color Background:** A deeper setting that supports CSS gradients. Users can visually construct linear or radial gradients, which the theme renders as a background property. This capability removes the need for custom CSS to achieve modern, high-fidelity visual effects.7

#### **2.2.4 Font Picker**

The font_picker connects directly to Shopify’s Font Library, which includes system fonts, Google Fonts, and licensed Monotype fonts.

- **Performance:** When a user selects a font, the platform handles the licensing and serving. The theme developer uses filters like font_url to load the specific WOFF2 files required. This setting returns a font object containing metadata about weights, styles, and family names, ensuring that the correct @font-face rules are generated.7

#### **2.2.5 URL and Video URL**

- **URL:** A smart input that allows searching internal resources (pages, blogs) or pasting external links.
- **Video URL:** specifically designed for YouTube or Vimeo links. It validates the input and often parses the video ID, allowing the theme to construct clean embed codes (e.g., \<iframe src="..."\>) rather than relying on raw user-pasted iframes.1

## ---

**3\. The Semantic Color System**

In the Dawn reference architecture, the application of color settings has evolved from discrete, element-specific pickers (e.g., "Header Background Color") to a holistic **Semantic Color Scheme** system. This architectural shift prioritizes consistency, accessibility, and maintainability.

### **3.1 Color Schemes and Grouping**

The settings_schema.json in Dawn defines multiple "Color Schemes" (typically labeled Scheme 1 through Scheme 5). Each scheme is a data object containing a synchronized palette of colors intended to work together.

- **Structure:** A scheme typically consists of:
  - **Background:** The canvas color.
  - **Text/Foreground:** The primary reading color.
  - **Solid Button Background:** The color of primary call-to-action buttons.
  - **Solid Button Label:** The text color within primary buttons.
  - **Outline Button:** The border color for secondary actions.
  - **Shadow:** The color used for depth effects.7

### **3.2 Semantic Roles and CSS Variables**

The power of this system lies in its implementation. Rather than hardcoding hex values into CSS rules, the theme iterates through the defined schemes in settings_data.json and generates a set of scoped CSS variables (Custom Properties).

For example, Scheme 1 might generate:

CSS

.color-scheme-1 {  
 \--color\-background: 255, 255, 255;  
 \--color\-foreground: 18, 18, 18;  
 \--color\-button: 18, 18, 18;  
 \--color\-button\-text: 255, 255, 255;  
}

Any section in the theme can then be assigned a class of .color-scheme-1. The elements inside that section (headings, paragraphs, buttons) utilize these generic variables (e.g., color: rgb(var(--color-foreground))).

This mechanism implies that changing a single color in Scheme 1 immediately propagates to every section using that scheme, ensuring broad consistency. It also facilitates complex design patterns like "dark mode" sections within a light theme, simply by applying a different scheme class to a specific container.11

### **3.3 Gradient Implementation**

The color_background setting adds a layer of visual fidelity. If a user defines a gradient for a scheme's background, the theme logic overrides the solid color variable with the gradient value. This allows for sophisticated "hero" sections or eye-catching banners that remain editable by non-technical staff.9

### **3.4 Accessibility Considerations**

The grouping of colors into schemes encourages accessibility compliance. By coupling "Background" and "Text" within the same configuration object, the interface implicitly reminds the user of the relationship between the two. While the theme engine does not strictly force WCAG compliance, the structure makes it easier for developers to implement warning messages or fallback logic if contrast ratios are insufficient.12

## ---

**4\. Typography Architecture: Scale and Performance**

Typography settings in Shopify are designed to manage the delicate balance between brand expression and web performance. The Dawn theme implements a dynamic scaling system that represents a best-practice standard for OS 2.0 themes.

### **4.1 Global Font Configuration**

The schema typically exposes two primary font_picker settings:

1. **Headings Font:** Applied to \<h1\> through \<h6\> elements.
2. **Body Font:** Applied to paragraphs, navigation, inputs, and buttons.

These settings are global. When a user changes the Heading font, the change cascades through the entire site. The underlying Liquid logic handles the generation of the @font-face declaration, utilizing font-display: swap to prevent invisible text during loading (FOIT).10

### **4.2 The Dynamic Scale System**

A significant innovation in Dawn is the **Typography Scale**, controlled by range inputs for type_header_scale and type_body_scale.

- **The Mechanism:** Instead of users setting static pixel values (e.g., "H1 is 32px"), they define a scale multiplier (e.g., 100%, 130%).
- **The 62.5% Baseline:** Dawn sets the html element’s font size to 62.5%. Since standard browser default text is 16px, this calculation results in a base size of 10px (16 \* 0.625).
- **REM Units:** All font sizes in the CSS are defined in rem units. 1rem equals the root size (10px). Therefore, 2.4rem is 24px.
- **Scaling Logic:** The user's scale setting modifies the root variable or the calculation applied to specific elements. If the Body Scale is set to 120%, the effective base calculation adjusts, proportionally increasing text size across the entire site while preserving the hierarchy between different heading levels.15

**Table 1: Typography Settings Impact Analysis**

| Setting ID        | Input Type  | Function                           | UX Implication                                    |
| :---------------- | :---------- | :--------------------------------- | :------------------------------------------------ |
| type_header_font  | font_picker | Selects font family for headers.   | Defines brand character; triggers asset download. |
| type_body_font    | font_picker | Selects font family for body text. | Affects readability; triggers asset download.     |
| type_header_scale | range       | Multiplier for heading sizes.      | Adjusts visual weight of titles globally.         |
| type_body_scale   | range       | Multiplier for body text sizes.    | Adjusts readability/density of information.       |

### **4.3 Performance Implications**

The decision to restrict users to a single Heading and Body font family is intentional. Loading multiple custom web font files significantly degrades page load speed (LCP). By limiting the global settings to two families, the architecture enforces a performance budget that benefits SEO and user retention.10

## ---

**5\. Layout and Spatial Configuration**

Layout settings control the storefront's containerization, spacing, and grid behavior. These settings determine how content adapts across different viewport sizes, from mobile devices to ultrawide desktop monitors.

### **5.1 Page Width Constraints**

The page_width setting is a crucial global variable, typically a number or range input (defaulting often to 1200px or 1600px).

- **Technical Role:** This value is assigned to a CSS variable (e.g., \--page-width).
- **Usage:** The .page-width utility class applies max-width: var(--page-width); margin: 0 auto;. This ensures that on large screens, content does not stretch to illegible lengths but remains centered. This setting gives merchants control over the "density" of their store—a narrower width feels more traditional and focused, while a wider width feels modern and expansive.20

### **5.2 Grid Spacing (Gutters)**

Modern themes expose granular control over the whitespace between elements.

- **Inputs:** spacing_grid_horizontal and spacing_grid_vertical are range inputs defining pixel values.
- **Responsiveness:** Recognizing that mobile screens have limited real estate, these settings often inject separate variables for mobile and desktop breakpoints (e.g., \--grid-mobile-horizontal-spacing). This allows for a tight, space-efficient grid on phones (e.g., 10px gaps) and a luxurious, airy grid on desktops (e.g., 30px gaps).22

### **5.3 Product Grid Configuration**

The Product Grid is the primary commercial interface. Global settings here dictate the display logic for collections and search results.

- **Card Styling:** Settings to toggle "Show second image on hover" (boolean) or "Show vendor" (boolean) affect the information density of the product card.
- **Image Ratio:** A select input allowing "Adapt to image," "Portrait," or "Square." "Adapt" respects the natural aspect ratio of the uploaded image, while "Square" forces a crop via object-fit: cover. This setting is critical for merchants with inconsistent product photography, allowing them to force uniformity via configuration rather than image editing.8
- **Badges:** Settings to control the position (e.g., "Bottom Left") and color scheme of "Sale" and "Sold Out" badges. This allows the merchant to ensure that these critical status indicators do not obscure the product image.25

## ---

**6\. Component-Level Settings**

Beyond the high-level systems of color and type, settings_schema.json includes detailed configuration for specific UI components. These "atomic" settings ensure that buttons, inputs, and cards maintain visual consistency across the site.

### **6.1 Buttons and CTAs**

Buttons are the primary interaction points. Settings allow users to define:

- **Border Radius:** A range input (0px to 40px) that controls the roundness of buttons. This updates a global variable (e.g., \--buttons-radius).
- **Shadows:** Inputs for shadow opacity, horizontal offset, vertical offset, and blur. This enables "flat" design (0 opacity) or "neumorphic"/depth-based design styles without CSS coding.
- **Border Thickness:** A range input controlling the outline weight for secondary buttons.
- **Behavior:** Checkboxes such as "Show 'Quick Add' button" inject a button directly onto product cards, altering the user journey by bypassing the product detail page for faster conversions.26

### **6.2 Input Fields and Forms**

To ensure that form elements (search bars, email signups, quantity selectors) match the button styling, Dawn includes settings for inputs_border_thickness and inputs_radius.

- **Consistency:** These settings often default to matching the button settings, but their separation allows for distinct styles (e.g., rounded buttons but square input fields).29

### **6.3 Drawers vs. Pages**

Interface behavior settings control how the cart operates. A select input for cart_type typically offers:

- **Page:** Redirects the user to /cart.
- **Drawer:** Opens a slide-out modal (AJAX cart).
- Notification: Shows a popup confirmation.  
  This setting fundamentally alters the site's JavaScript behavior and user flow, affecting how cart-notification.js or cart-drawer.js are loaded and executed.8

### **6.4 Social Media and Metadata**

The schema includes a dedicated section for Social Media.

- **Inputs:** Text fields for Facebook, Instagram, TikTok, etc.
- **Logic:** If a URL is present in the setting, the corresponding icon automatically renders in the footer and social sharing components. This conditional rendering logic ({% if settings.social\_twitter\_link\!= blank %}) prevents empty icons from cluttering the UI.
- **Favicon:** An image_picker specifically for the browser tab icon. This is a critical branding element that, if missing, defaults to the generic Shopify bag icon.30

## ---

**7\. The Checkout Branding API**

While the settings discussed above control the storefront (theme), the Checkout environment is secured and historically locked down. For Shopify Plus merchants, the **Checkout Branding API** exposes a distinct set of user-defined settings accessible via the Checkout Editor. This system is technically distinct from settings_schema.json but serves the same conceptual purpose.29

### **7.1 The Design System Object**

The Checkout Branding API organizes settings into a hierarchical designSystem object, which is stricter than the flat theme schema.

- **Global Colors:** Settings for background, text, accent, and decorative colors.
- **Typography:** Separate font selections for Primary (headings) and Secondary (body) text.
- **Shapes:** A unified cornerRadius setting that applies to buttons, fields, and checkboxes, ensuring specific visual consistency within the checkout flow.31

### **7.2 Granular Customizations**

Unlike the theme, where CSS can override anything, checkout settings are strictly typed. The customizations object allows targeting specific checkout areas:

- **header**: Alignment of logo, visibility of breadcrumbs.
- **main**: Background color or image for the main input area.
- **orderSummary**: Background color for the sidebar showing line items.
- **content**: Divider styles (lines vs. hidden), input field label positions (inside vs. outside).

**Table 2: Checkout vs. Theme Settings Comparison**

| Feature         | Theme Settings (settings_schema.json) | Checkout Branding API             |
| :-------------- | :------------------------------------ | :-------------------------------- |
| **Scope**       | Storefront (Home, Product, Cart)      | Checkout, Thank You, Order Status |
| **Technology**  | Liquid / CSS Variables                | GraphQL API / React Components    |
| **Flexibility** | Unlimited (Custom CSS)                | Strict (Defined Properties Only)  |
| **Storage**     | settings_data.json                    | Checkout Profile (Server-side)    |
| **Access**      | All Merchants                         | Shopify Plus (mostly)             |

The Checkout Editor provides a UI similar to the Theme Editor to manipulate these API values, bridging the gap between the customizable storefront and the secure transaction environment.29

## ---

**8\. Developer Workflow and Best Practices**

The creation of these settings is a deliberate engineering task. Developers must balance flexibility with maintainability.

### **8.1 Schema Validation and Types**

Developers define the schema in JSON. Each input object requires a type, id, label, and optionally default.

- **Best Practice:** Using default values is critical. Without them, a fresh theme install might render blank areas or broken styles until the merchant manually configures the setting.
- **Sidebar Settings:** Using header and paragraph types helps break up long lists of settings, acting as documentation-in-code for the merchant.1

### **8.2 Presets and Styles**

The settings_data.json file supports a presets key. This allows developers to ship the theme with multiple configuration states. A "Dark Mode" preset might have all color schemes inverted compared to the "Light Mode" preset.

- **Mechanism:** When a user selects a preset in the editor, the platform performs a bulk update, overwriting the current values in settings_data.json with the values from the selected preset object. This allows for radical design transformations without code changes.4

### **8.3 Dynamic Sources**

A recent advancement in OS 2.0 is the integration of **Dynamic Sources**. In the settings UI, compatible inputs (like text, image_picker, url) display a "Connect Dynamic Source" icon.

- **Function:** This allows the setting to draw its value from a Metafield (e.g., a "Product Care Guide" file) or a standard resource attribute (e.g., "Product Vendor") rather than a static string.
- **Implication:** This blurs the line between "Global Settings" and "Content," allowing theme settings to act as templates for dynamic data.1

## ---

**9\. Comprehensive Reference of Suggested Settings**

Based on the research into the Dawn theme and standard Shopify practices, the following is a categorized list of suggested settings that define a complete, robust theme configuration.

### **9.1 Global Colors Category**

| Setting ID                 | Input Type       | Suggested Usage      | Description                                |
| :------------------------- | :--------------- | :------------------- | :----------------------------------------- |
| colors_background_1        | Color            | \#FFFFFF             | Primary page background.                   |
| colors_text                | Color            | \#121212             | Primary body text color.                   |
| colors_solid_button_labels | Color            | \#FFFFFF             | Text inside solid buttons.                 |
| colors_accent_1            | Color            | \#000000             | Links, highlights, and active states.      |
| colors_accent_2            | Color            | \#334FB4             | Sale badges or secondary alerts.           |
| gradient_background_1      | Color Background | linear-gradient(...) | Optional gradient override for background. |

### **9.2 Typography Category**

| Setting ID        | Input Type  | Suggested Usage     | Description                        |
| :---------------- | :---------- | :------------------ | :--------------------------------- |
| type_header_font  | Font Picker | Assistant, Playfair | Font family for H1-H6.             |
| type_body_font    | Font Picker | Inter, Helvetica    | Font family for body text.         |
| type_header_scale | Range       | 100% \- 150%        | Scale multiplier for headings.     |
| type_body_scale   | Range       | 100% \- 130%        | Scale multiplier for reading text. |

### **9.3 Layout Category**

| Setting ID              | Input Type   | Suggested Usage | Description                           |
| :---------------------- | :----------- | :-------------- | :------------------------------------ |
| page_width              | Number/Range | 1200            | Maximum width of content container.   |
| spacing_grid_horizontal | Range        | 8px \- 40px     | Horizontal gutter between grid items. |
| spacing_grid_vertical   | Range        | 8px \- 40px     | Vertical gutter between grid items.   |

### **9.4 Buttons & Inputs Category**

| Setting ID                       | Input Type | Suggested Usage | Description                           |
| :------------------------------- | :--------- | :-------------- | :------------------------------------ |
| buttons_border_thickness         | Range      | 0px \- 5px      | Stroke width for outlined buttons.    |
| buttons_opacity                  | Range      | 0% \- 100%      | Ghost button transparency.            |
| buttons_radius                   | Range      | 0px \- 40px     | Corner roundness (0=square, 40=pill). |
| buttons_shadow_opacity           | Range      | 0% \- 100%      | Intensity of drop shadow.             |
| buttons_shadow_horizontal_offset | Range      | \-10px to 10px  | X-axis shadow displacement.           |

### **9.5 Product Card Category**

| Setting ID           | Input Type | Suggested Usage | Description                              |
| :------------------- | :--------- | :-------------- | :--------------------------------------- |
| image_ratio          | Select     | Adapt, Portrait | Aspect ratio control for product images. |
| show_secondary_image | Checkbox   | true            | Show second image on mouse hover.        |
| show_vendor          | Checkbox   | false           | Display brand/vendor name on card.       |
| show_rating          | Checkbox   | false           | Show star rating (requires review app).  |
| enable_quick_add     | Checkbox   | true            | Show "Add to Cart" button on card.       |

### **9.6 Social Media Category**

| Setting ID            | Input Type | Description                    |
| :-------------------- | :--------- | :----------------------------- |
| social_facebook_link  | URL        | Full URL to Facebook profile.  |
| social_instagram_link | URL        | Full URL to Instagram profile. |
| social_youtube_link   | URL        | Full URL to YouTube channel.   |
| social_tiktok_link    | URL        | Full URL to TikTok profile.    |
| social_twitter_link   | URL        | Full URL to Twitter/X profile. |
| social_pinterest_link | URL        | Full URL to Pinterest profile. |
| social_snapchat_link  | URL        | Full URL to Snapchat profile.  |
| social_tumblr_link    | URL        | Full URL to Tumblr profile.    |
| social_vimeo_link     | URL        | Full URL to Vimeo profile.     |

### **9.7 Miscellaneous/Advanced Category**

| Setting ID                | Input Type   | Description                              |
| :------------------------ | :----------- | :--------------------------------------- |
| favicon                   | Image Picker | 32x32px icon for browser tab.            |
| currency_code_enabled     | Checkbox     | Show ISO code (USD, EUR) next to prices. |
| cart_type                 | Select       | drawer, page, notification.              |
| predictive_search_enabled | Checkbox     | Enable auto-complete in search bar.      |

## ---

**10\. Conclusion**

The architecture of user-defined settings in Shopify represents a robust implementation of the "Infrastructure as Code" philosophy applied to frontend design. By serializing design decisions into the settings_data.json file via the strict definitions of settings_schema.json, Shopify achieves a dual victory: developers can maintain a clean, version-controlled codebase, while merchants gain granular control over their store's appearance without technical risk.

The Dawn theme demonstrates the maturity of this system, moving beyond simple property toggles to integrated design systems. The semantic linkage of Color Schemes and the proportional logic of the Typography Scale ensure that user customizations remain accessible and visually coherent. Furthermore, the extension of this logic into the Checkout Branding API signals a future where the distinction between the custom storefront and the secure platform core becomes increasingly seamless, driven entirely by sophisticated, user-defined configuration data.

#### **Works cited**

1. Settings \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/storefronts/themes/architecture/settings](https://shopify.dev/docs/storefronts/themes/architecture/settings)
2. settings_schema.json \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/storefronts/themes/architecture/config/settings-schema-json](https://shopify.dev/docs/storefronts/themes/architecture/config/settings-schema-json)
3. Issues with settings_schema.json when changing parameters and pushing to github, accessed December 30, 2025, [https://community.shopify.com/t/issues-with-settings-schema-json-when-changing-parameters-and-pushing-to-github/67668](https://community.shopify.com/t/issues-with-settings-schema-json-when-changing-parameters-and-pushing-to-github/67668)
4. settings_data.json \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/storefronts/themes/architecture/config/settings-data-json](https://shopify.dev/docs/storefronts/themes/architecture/config/settings-data-json)
5. Understanding Shopify Theme Styles and Presets With settings_data.json, accessed December 30, 2025, [https://www.shopify.com/partners/blog/shopify-theme-styles-and-presets](https://www.shopify.com/partners/blog/shopify-theme-styles-and-presets)
6. Input settings \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings)
7. Specialized Input Settings ( Schema ) In Shopify | CodeCrew Infotech, accessed December 30, 2025, [https://codecrewinfotech.com/specialized-input-settings-schema-in-shopify/](https://codecrewinfotech.com/specialized-input-settings-schema-in-shopify/)
8. Shopify Dawn Theme Customization Guide With Demo \- identixweb, accessed December 30, 2025, [https://www.identixweb.com/the-ultimate-guide-to-shopify-dawn-theme-for-beginners/](https://www.identixweb.com/the-ultimate-guide-to-shopify-dawn-theme-for-beginners/)
9. How to Change Color Scheme in Shopify \- Praella, accessed December 30, 2025, [https://praella.com/blogs/shopify-insights/how-to-change-color-scheme-in-shopify](https://praella.com/blogs/shopify-insights/how-to-change-color-scheme-in-shopify)
10. Fonts \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts](https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts)
11. A Developer's Technical Breakdown of Shopify's Dawn Theme | by Jonny Taft \- Medium, accessed December 30, 2025, [https://medium.com/@johnny-taft/a-developers-technical-breakdown-of-shopify-s-dawn-theme-0c2c03bad3a3](https://medium.com/@johnny-taft/a-developers-technical-breakdown-of-shopify-s-dawn-theme-0c2c03bad3a3)
12. Color system best practices \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/storefronts/themes/best-practices/design/color-system](https://shopify.dev/docs/storefronts/themes/best-practices/design/color-system)
13. Exploring color schemes, gradients, and animated backgrounds in the Multi Shopify theme, accessed December 30, 2025, [https://www.youtube.com/watch?v=IGEkRh5kkMs](https://www.youtube.com/watch?v=IGEkRh5kkMs)
14. The Ultimate Guide: How to Change Font on Shopify Dawn Theme \- HulkApps, accessed December 30, 2025, [https://www.hulkapps.com/blogs/shopify-hub/the-ultimate-guide-how-to-change-font-on-shopify-dawn-theme](https://www.hulkapps.com/blogs/shopify-hub/the-ultimate-guide-how-to-change-font-on-shopify-dawn-theme)
15. Dawn Theme \- change font size without code? \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/t/dawn-theme-change-font-size-without-code/64125](https://community.shopify.com/t/dawn-theme-change-font-size-without-code/64125)
16. How to Change Font in Shopify Dawn Theme \- YouTube, accessed December 30, 2025, [https://www.youtube.com/watch?v=KGzS2ZULmyc](https://www.youtube.com/watch?v=KGzS2ZULmyc)
17. where can i find the base font size for the dawn theme \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/c/shopify-design/where-can-i-find-the-base-font-size-for-the-dawn-theme/m-p/2788356](https://community.shopify.com/c/shopify-design/where-can-i-find-the-base-font-size-for-the-dawn-theme/m-p/2788356)
18. Adjust line height of body text in Dawn theme \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/t/adjust-line-height-of-body-text-in-dawn-theme/387155](https://community.shopify.com/t/adjust-line-height-of-body-text-in-dawn-theme/387155)
19. How to Change Font on Shopify Dawn Theme: A Comprehensive Guide | Tevello, accessed December 30, 2025, [https://tevello.com/blogs/shopify-guides/how-to-change-font-on-shopify-dawn-theme-a-comprehensive-guide](https://tevello.com/blogs/shopify-guides/how-to-change-font-on-shopify-dawn-theme-a-comprehensive-guide)
20. How to Change Page Width in Shopify Dawn theme \- YouTube, accessed December 30, 2025, [https://www.youtube.com/watch?v=0EXlIYE6OlI](https://www.youtube.com/watch?v=0EXlIYE6OlI)
21. How to change the width of a custom page in dawn theme \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/t/how-to-change-the-width-of-a-custom-page-in-dawn-theme/357941](https://community.shopify.com/t/how-to-change-the-width-of-a-custom-page-in-dawn-theme/357941)
22. Shopify Dawn Theme Product Grid Spacing, accessed December 30, 2025, [https://community.shopify.com/t/shopify-dawn-theme-product-grid-spacing/386757](https://community.shopify.com/t/shopify-dawn-theme-product-grid-spacing/386757)
23. Increase the gap between featured collection products \- dawn theme \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/t/increase-the-gap-between-featured-collection-products-dawn-theme/554799](https://community.shopify.com/t/increase-the-gap-between-featured-collection-products-dawn-theme/554799)
24. dawn/snippets/card-product.liquid at main \- GitHub, accessed December 30, 2025, [https://github.com/Shopify/dawn/blob/main/snippets/card-product.liquid](https://github.com/Shopify/dawn/blob/main/snippets/card-product.liquid)
25. Shopify for beginner: 8 handy options to customize the Dawn theme, accessed December 30, 2025, [https://posstack.com/blog/shopify-dawn-theme-customization](https://posstack.com/blog/shopify-dawn-theme-customization)
26. Dawn Theme \- Customise Quick add Buttons \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/t/dawn-theme-customise-quick-add-buttons/374660](https://community.shopify.com/t/dawn-theme-customise-quick-add-buttons/374660)
27. How can I add animated buttons to the Dawn theme? \- Shopify Community, accessed December 30, 2025, [https://community.shopify.com/t/how-can-i-add-animated-buttons-to-the-dawn-theme/221307](https://community.shopify.com/t/how-can-i-add-animated-buttons-to-the-dawn-theme/221307)
28. How To Change The Color Of Buttons On The Dawn Theme in Shopify 2025 \- YouTube, accessed December 30, 2025, [https://www.youtube.com/watch?v=835bvFFab84](https://www.youtube.com/watch?v=835bvFFab84)
29. Using the branding editor in Checkout Blocks \- Shopify Help Center, accessed December 30, 2025, [https://help.shopify.com/en/manual/checkout-settings/checkout-blocks/branding-editor](https://help.shopify.com/en/manual/checkout-settings/checkout-blocks/branding-editor)
30. 5 Easy Steps to Configure Your Shopify Settings Schema \- First Pier, accessed December 30, 2025, [https://www.firstpier.com/resources/shopify-settings-schema](https://www.firstpier.com/resources/shopify-settings-schema)
31. About checkout styling \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/apps/build/checkout/styling](https://shopify.dev/docs/apps/build/checkout/styling)
32. CheckoutBranding \- GraphQL Admin \- Shopify Dev Docs, accessed December 30, 2025, [https://shopify.dev/docs/api/admin-graphql/latest/objects/CheckoutBranding](https://shopify.dev/docs/api/admin-graphql/latest/objects/CheckoutBranding)
