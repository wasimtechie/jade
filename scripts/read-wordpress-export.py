"""Read WXR with the standard library; ignore pages, plugin data and user secrets."""
import json
import sys
import xml.etree.ElementTree as ET

NS = {
    "wp": "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "dc": "http://purl.org/dc/elements/1.1/",
}


def text(node, name):
    return node.findtext(name, default="", namespaces=NS)


def read_export(filename):
    channel = ET.parse(filename).getroot().find("channel")
    if channel is None:
        raise ValueError("Not a WordPress WXR export")
    posts, attachments = [], {}
    authors = {text(a, "wp:author_login"): text(a, "wp:author_display_name")
               for a in channel.findall("wp:author", NS)}
    categories = {text(c, "wp:term_id"): text(c, "wp:cat_name")
                  for c in channel.findall("wp:category", NS)}
    for item in channel.findall("item"):
        kind = text(item, "wp:post_type")
        if kind not in ("post", "attachment"):
            continue
        meta = {}
        old_slugs = []
        for m in item.findall("wp:postmeta", NS):
            key, value = text(m, "wp:meta_key"), text(m, "wp:meta_value")
            if key == "_wp_old_slug":
                old_slugs.append(value)
            if key.startswith(("rank_math_", "_yoast_wpseo_")) or key in (
                    "_thumbnail_id", "_elementor_data", "_wp_attachment_image_alt"):
                meta[key] = value
        post_id = text(item, "wp:post_id")
        if kind == "attachment":
            attachments[post_id] = {
                "url": text(item, "wp:attachment_url"),
                "alt": meta.get("_wp_attachment_image_alt", ""),
                "title": text(item, "title"),
            }
            continue
        content = text(item, "content:encoded")
        # Elementor's rendered post_content is authoritative. Recover supported
        # widgets only when that body is missing; exclude related-post widgets.
        fallback = []
        if len(content.strip()) < 100:
            def walk(elements):
                for element in elements:
                    settings = element.get("settings", {})
                    kind = element.get("widgetType")
                    if kind in ("html", "text-editor"):
                        fallback.append(settings.get("html" if kind == "html" else "editor", ""))
                    elif kind == "heading":
                        fallback.append("<h2>" + settings.get("title", "") + "</h2>")
                    walk(element.get("elements", []))
            try:
                walk(json.loads(meta.get("_elementor_data", "[]")))
            except (ValueError, TypeError):
                pass
        meta.pop("_elementor_data", None)
        posts.append({
            "id": post_id, "title": text(item, "title"),
            "slug": text(item, "wp:post_name"), "url": text(item, "link"),
            "status": text(item, "wp:status"), "content": content,
            "fallbackContent": "\n".join(fallback),
            "excerpt": text(item, "excerpt:encoded"),
            "publishedAt": text(item, "wp:post_date"),
            "dateModified": text(item, "wp:post_modified"),
            "author": authors.get(text(item, "dc:creator"), text(item, "dc:creator")),
            "categories": [c.text or "" for c in item.findall("category")
                           if c.get("domain") == "category"],
            "tags": [c.text or "" for c in item.findall("category")
                     if c.get("domain") == "post_tag"],
            "oldSlugs": old_slugs, "meta": meta,
        })
    return {"site": text(channel, "link"), "posts": posts,
            "attachments": attachments, "categories": categories}


if __name__ == "__main__":
    json.dump(read_export(sys.argv[1]), sys.stdout, ensure_ascii=False)
