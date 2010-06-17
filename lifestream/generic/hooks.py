import re

import lxml.etree
import lxml.html.soupparser

from bleach import Bleach
bleach = Bleach()


def tidy_up(entry, log):
    # TODO Security, mostly using bleach to linkify and cleanup (tidy style)
    html_tags = ['a', 'abbr', 'b', 'blockquote', 'br',
                 'cite', 'code', 'dd', 'dl', 'div', 'dt',
                 'em', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                 'i', 'img', 'hr',
                 'math', 'mi', 'mo', 'mn', 'mfrac', 'mrow', 'msqrt', 'msup',
                 'pre', 'span', 'strong',
                 'svg', 'path', 'line', 'circle',
                 'strike', 'strong', 'sub'
                 'table', 'caption', 'thead', 'tfoot', 'tbody', 'tr', 'td', 'th', 'colgroup', 'col',
                 'tt', 'var',
                 'ul', 'li', 'ol', 'p', 'q']
    
    a_attrs = ['href', 'rel', 'title']
    img_attrs = ['align', 'alt', 'border', 'height','src', 'width']
    basic_attrs = ['class', 'dir', 'lang', 'title']
    
    [x.extend(basic_attrs) for x in (a_attrs, img_attrs)]
    
    attrs = {
        'a': a_attrs,
        'img': img_attrs,
        
        'abbr':    basic_attrs,
        'acronym': basic_attrs,
        'div': basic_attrs,
        'span': basic_attrs,
        'p': basic_attrs,
        
    }
    try:
        
        htmlElement = lxml.html.soupparser.fromstring(entry)
        if htmlElement.getchildren():            
            elements = ''.join([lxml.html.tostring(el) for el in htmlElement.getchildren()])
        else:
            elements = entry        
        return bleach.linkify(
                bleach.clean(elements, tags=html_tags, attributes=attrs))
    except Exception, x:
        log.error("Ouch, unable to linkify or clean _%s_\nError: %s" % (entry, x))
        log.exception(x)
        return entry

def prepare_entry(entryJSON, log):    
    content = ''
    if 'content' in entryJSON:        
        content = entryJSON['content'][0].value
    elif 'description' in entryJSON:
        content = entryJSON['description']
    else:
        #log.debug('unreadable... ' + str(entryJSON))
        pass
        
    title = tidy_up(entryJSON['title'], log)
    content = tidy_up(content, log)
            
    tags = []
    if 'tags' in entryJSON:
        for tag in entryJSON['tags']:
            if 'term' in tag:
                tags.append({'tag': tag['term'], 'name': tag['term']})
    return {'entry': content, 'tags': tags, 'title': title, 'permalink': entryJSON['link'], 'raw': entryJSON}