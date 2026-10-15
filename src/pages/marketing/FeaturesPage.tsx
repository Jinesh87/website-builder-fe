import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.tsx";
import { MediaTile, TemplateFrame } from "./MiniSite.tsx";
import Tabs from "./Tabs.tsx";

export default function FeaturesPage() {
  const [group, setGroup] = useState<"build" | "manage" | "publish">("build");

  return (
    <div className="view" data-view="features">
      <div className="page-hero split-hero">
        <div className="wrap">
          <div className="stack" style={{ gap: "16px" }}>
            <div className="eyebrow">Features</div>
            <h1>Everything you need to build and publish a business website</h1>
            <p className="lead">
              Build it yourself with templates and sections, or let AI create the first draft. Both give you the same
              fully editable website.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/signup" className="btn p lg">
                Start building
              </Link>
              <Link to="/templates" className="btn lg">
                See templates
              </Link>
            </div>
          </div>
          <div className="collage">
            <div className="ui themeui">
              <div className="ui-bar">
                <i />
                <i />
                <i />
                <span>Theme</span>
              </div>
              <div className="th">
                <div>
                  <span className="ui-lab">Colours</span>
                  <span className="th-sw">
                    <i style={{ background: "#3550E8" }} />
                    <i style={{ background: "#F2603F" }} />
                    <i style={{ background: "#0FA37F" }} />
                    <i style={{ background: "#F5A300" }} />
                    <i style={{ background: "#121735" }} />
                  </span>
                </div>
                <div>
                  <span className="ui-lab">Fonts</span>
                  <span className="th-fonts">
                    <b style={{ fontFamily: "'Playfair Display',serif" }}>Aa</b>
                    <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Aa</b>
                    <b style={{ fontFamily: "'Libre Baskerville',serif" }}>Aa</b>
                    <b style={{ fontFamily: "'Sora',sans-serif" }}>Aa</b>
                  </span>
                </div>
                <div>
                  <span className="ui-lab">Buttons</span>
                  <span className="th-btns">
                    <em className="f">Book now</em>
                    <em className="o">Book now</em>
                    <em className="r">Book now</em>
                  </span>
                </div>
                <div>
                  <span className="ui-lab">Corners</span>
                  <span className="ui-range">
                    <i style={{ width: "40%" }} />
                  </span>
                </div>
              </div>
            </div>
            <div className="cl-2">
              <div className="ui chatui">
                <div className="ui-bar">
                  <i />
                  <i />
                  <i />
                  <span>AI builder</span>
                </div>
                <div className="ui-chat">
                  <div className="b me">
                    A website for a yoga studio with classes, timetable, teachers and a booking form. Calm colours.
                  </div>
                  <div className="b ai">
                    <b>Draft ready</b>
                    <span className="steps">
                      <em>✓ Theme chosen: Calm Sand</em>
                      <em>✓ 5 pages, 17 sections</em>
                      <em>✓ Content written</em>
                    </span>
                    <span className="chips">
                      <i>Home</i>
                      <i>Classes</i>
                      <i>Timetable</i>
                      <i>Teachers</i>
                      <i>Contact</i>
                    </span>
                  </div>
                  <div className="b me">Make the hero photo bigger and add prices.</div>
                  <div className="b ai">
                    Done. Review the change on Home{" "}
                    <span className="keep">
                      <i>Keep</i>
                      <i className="o">Undo</i>
                    </span>
                  </div>
                </div>
                <div className="ui-input">
                  <span>Describe a change…</span>
                  <b>➜</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className="wrap">
          <div className="sec-head center">
            <Tabs
              label="Feature group"
              value={group}
              onChange={setGroup}
              items={[
                {
                  key: "build",
                  label: (
                    <>
                      <Icon name="layout" className="ti" /> Building
                    </>
                  ),
                },
                {
                  key: "manage",
                  label: (
                    <>
                      <Icon name="layers" className="ti" /> Managing
                    </>
                  ),
                },
                {
                  key: "publish",
                  label: (
                    <>
                      <Icon name="globe" className="ti" /> Publishing
                    </>
                  ),
                },
              ]}
            />
          </div>
          <div className="fgroup" data-g="build" hidden={group !== "build"}>
            <div className="frow">
              <div className="fr-text">
                <span className="tile c0">
                  <Icon name="layout" className="ico" />
                </span>
                <div className="eyebrow plain">Manual builder</div>
                <h2>Edit every page without code</h2>
                <p className="lead">
                  Pick a template, then add, reorder, hide or duplicate sections. Click any text or image to change it.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Page templates for Home, About, Services, Contact, Blog and landing pages</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Move sections up and down, add blocks inside them</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Save a section once and reuse it on any page</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c0-bg">
                <div className="ui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>Editor · Home</span>
                    <b className="ui-pill mint">Draft saved</b>
                  </div>
                  <div className="ui-ed">
                    <div className="ui-col">
                      <span className="ui-lab">Sections</span>
                      <span className="ui-row">⋮⋮ Hero</span>
                      <span className="ui-row on">⋮⋮ Services</span>
                      <span className="ui-row">⋮⋮ Testimonials</span>
                      <span className="ui-row">
                        ⋮⋮ FAQ <em>Hidden</em>
                      </span>
                      <span className="ui-row add">+ Add section</span>
                    </div>
                    <div className="ui-canvas">
                      <div className="ui-blk">
                        <b style={{ width: "55%" }} />
                        <i style={{ width: "35%" }} />
                        <u />
                      </div>
                      <div className="ui-blk sel">
                        <b style={{ width: "30%" }} />
                        <div className="ui-3">
                          <span />
                          <span />
                          <span />
                        </div>
                        <em className="ui-tools">↑ ↓ ⧉ ✕</em>
                      </div>
                      <div className="ui-blk">
                        <b style={{ width: "40%" }} />
                        <div className="ui-3 two">
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                    <div className="ui-col">
                      <span className="ui-lab">Layout</span>
                      <span className="ui-sel">3 columns ▾</span>
                      <span className="ui-lab">Background</span>
                      <span className="ui-sw">
                        <i style={{ background: "#fff" }} />
                        <i style={{ background: "#EEF0F6" }} />
                        <i style={{ background: "#E1F6EF" }} />
                        <i style={{ background: "#121735" }} />
                      </span>
                      <span className="ui-lab">Spacing</span>
                      <span className="ui-range">
                        <i />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="frow flip">
              <div className="fr-text">
                <span className="tile c4">
                  <Icon name="sparkle" className="ico" />
                </span>
                <div className="eyebrow plain">AI builder</div>
                <h2>Describe your business. Get a website draft.</h2>
                <p className="lead">
                  Write what you need in plain words. AI picks a template, creates the pages and writes the content. Ask
                  for changes the same way.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Uses the same sections as the manual builder</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Every AI change is a draft you review first</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Clear message when something isn't supported</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c4-bg">
                <div className="ui chatui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>AI builder</span>
                  </div>
                  <div className="ui-chat">
                    <div className="b me">
                      A website for a yoga studio with classes, timetable, teachers and a booking form. Calm colours.
                    </div>
                    <div className="b ai">
                      <b>Draft ready</b>
                      <span className="steps">
                        <em>✓ Theme chosen: Calm Sand</em>
                        <em>✓ 5 pages, 17 sections</em>
                        <em>✓ Content written</em>
                      </span>
                      <span className="chips">
                        <i>Home</i>
                        <i>Classes</i>
                        <i>Timetable</i>
                        <i>Teachers</i>
                        <i>Contact</i>
                      </span>
                    </div>
                    <div className="b me">Make the hero photo bigger and add prices.</div>
                    <div className="b ai">
                      Done. Review the change on Home{" "}
                      <span className="keep">
                        <i>Keep</i>
                        <i className="o">Undo</i>
                      </span>
                    </div>
                  </div>
                  <div className="ui-input">
                    <span>Describe a change…</span>
                    <b>➜</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="frow">
              <div className="fr-text">
                <span className="tile c3">
                  <Icon name="palette" className="ico" />
                </span>
                <div className="eyebrow plain">Theme and brand</div>
                <h2>Your colours and fonts on every page</h2>
                <p className="lead">
                  Set your brand once. Buttons, headings, cards and spacing update across the whole website.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Primary and secondary colours, background and text</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Heading and body fonts, button and card styles</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Corner radius, container width and section spacing</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c3-bg">
                <div className="ui themeui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>Theme</span>
                  </div>
                  <div className="th">
                    <div>
                      <span className="ui-lab">Colours</span>
                      <span className="th-sw">
                        <i style={{ background: "#3550E8" }} />
                        <i style={{ background: "#F2603F" }} />
                        <i style={{ background: "#0FA37F" }} />
                        <i style={{ background: "#F5A300" }} />
                        <i style={{ background: "#121735" }} />
                      </span>
                    </div>
                    <div>
                      <span className="ui-lab">Fonts</span>
                      <span className="th-fonts">
                        <b style={{ fontFamily: "'Playfair Display',serif" }}>Aa</b>
                        <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Aa</b>
                        <b style={{ fontFamily: "'Libre Baskerville',serif" }}>Aa</b>
                        <b style={{ fontFamily: "'Sora',sans-serif" }}>Aa</b>
                      </span>
                    </div>
                    <div>
                      <span className="ui-lab">Buttons</span>
                      <span className="th-btns">
                        <em className="f">Book now</em>
                        <em className="o">Book now</em>
                        <em className="r">Book now</em>
                      </span>
                    </div>
                    <div>
                      <span className="ui-lab">Corners</span>
                      <span className="ui-range">
                        <i style={{ width: "40%" }} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fgroup" data-g="manage" hidden={group !== "manage"}>
            <div className="frow">
              <div className="fr-text">
                <span className="tile c5">
                  <Icon name="layers" className="ico" />
                </span>
                <div className="eyebrow plain">Dashboard</div>
                <h2>All your websites in one place</h2>
                <p className="lead">
                  See every website you own, its status and its address. Open any one to keep editing.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Published, draft and unpublished-changes labels</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Create another website in two clicks</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Website settings: business info, logo and contact details</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c5-bg">
                <div className="ui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>My websites</span>
                    <b className="ui-pill">+ Create website</b>
                  </div>
                  <div className="dash">
                    <div className="dcard">
                      <TemplateFrame t={6} className="dthumb" />
                      <b>Lumen Dental Care</b>
                      <span className="ui-pill mint">Published</span>
                    </div>
                    <div className="dcard">
                      <TemplateFrame t={7} className="dthumb" />
                      <b>Saffron Table</b>
                      <span className="ui-pill sun">Draft</span>
                    </div>
                    <div className="dcard new">
                      <span>+</span>
                      <b>New website</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="frow flip">
              <div className="fr-text">
                <span className="tile c1">
                  <Icon name="image" className="ico" />
                </span>
                <div className="eyebrow plain">Media library</div>
                <h2>Images, videos and files, organised</h2>
                <p className="lead">
                  Upload once and use anywhere on your website. Add alt text so images are accessible and searchable.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Folders, search, rename and delete</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Pick from the library while editing</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Images optimised for the web where supported</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c1-bg">
                <div className="ui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>Media library</span>
                    <b className="ui-pill sky">Upload</b>
                  </div>
                  <div className="media-in">
                    <div className="mgrid">
                      <MediaTile art="office|#3550E8|#ECEFFF|#14213D|#FFFFFF" />
                      <MediaTile art="food|#E0A33B|#2C1F18|#F7EBDD|#1E1410" />
                      <MediaTile art="clinic|#0E7C9A|#E5F3F7|#0B2D3A|#FFFFFF" />
                      <MediaTile art="gallery|#111111|#E6E6E1|#111111|#F4F4F2" />
                      <MediaTile art="tools|#0F7B6C|#E6F4F1|#0E2A2A|#FFFFFF" />
                      <MediaTile art="agency|#FF5A36|#1C1C22|#F5F5F0|#0F0F12" />
                    </div>
                    <div className="m-names">
                      <span>hero-1.jpg</span>
                      <span>menu.jpg</span>
                      <span>smile.jpg</span>
                      <span>studio.jpg</span>
                      <span>van.jpg</span>
                      <span>brand.png</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="frow">
              <div className="fr-text">
                <span className="tile c2">
                  <Icon name="lock" className="ico" />
                </span>
                <div className="eyebrow plain">Privacy</div>
                <h2>Your work stays yours</h2>
                <p className="lead">
                  Each client account is separate. Nobody else can view or edit your websites, files or settings.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Separate workspace for every client</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Super Admin manages accounts and templates</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Suspended accounts can't log in</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c2-bg">
                <div className="privacy">
                  <div className="pv-lock">
                    <Icon name="lock" className="big" />
                  </div>
                  <div className="pv-row">
                    <span className="pv-av a">A</span>
                    <b>Client A</b>
                    <em>Sees only Client A's websites</em>
                  </div>
                  <div className="pv-row">
                    <span className="pv-av b">B</span>
                    <b>Client B</b>
                    <em>Sees only Client B's websites</em>
                  </div>
                  <div className="pv-row">
                    <span className="pv-av s">SA</span>
                    <b>Super Admin</b>
                    <em>Manages all clients</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fgroup" data-g="publish" hidden={group !== "publish"}>
            <div className="frow">
              <div className="fr-text">
                <span className="tile c5">
                  <Icon name="devices" className="ico" />
                </span>
                <div className="eyebrow plain">Responsive preview</div>
                <h2>Looks right on every screen</h2>
                <p className="lead">
                  Switch between desktop, tablet and mobile before you publish. Columns and menus adapt on their own.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Desktop, tablet and mobile preview</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Hide sections on mobile if you need to</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>The live site uses the same rules as the preview</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c5-bg">
                <div className="devwrap">
                  <div className="devs">
                    <div className="d-desk">
                      <div className="ui-bar">
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="d-hero">
                        <b />
                        <i />
                        <u />
                      </div>
                      <div className="d-3">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className="d-tab">
                      <div className="d-hero">
                        <b />
                        <i />
                        <u />
                      </div>
                      <div className="d-3 two">
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className="d-phone">
                      <div className="d-hero">
                        <b />
                        <u />
                      </div>
                      <div className="d-3 one">
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="frow flip">
              <div className="fr-text">
                <span className="tile c0">
                  <Icon name="pencil" className="ico" />
                </span>
                <div className="eyebrow plain">Drafts and checks</div>
                <h2>Nothing goes live by accident</h2>
                <p className="lead">
                  Every change is saved as a draft. Before publishing we check for missing page URLs, menus and image
                  alt text.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Draft, preview, then publish</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>If publishing fails, your last live version stays online</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Edit a live website and publish the update later</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c0-bg">
                <div className="ui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>Publish</span>
                  </div>
                  <div className="pub">
                    <span className="ui-lab">Checks</span>
                    <span className="chk ok">✓ All pages have a URL</span>
                    <span className="chk ok">✓ Header and footer set</span>
                    <span className="chk warn">! 2 images need alt text</span>
                    <span className="ui-lab">History</span>
                    <span className="hist">
                      <i className="g" />
                      Published · Today 10:42
                    </span>
                    <span className="hist">
                      <i className="b" />
                      Draft saved · Today 10:31
                    </span>
                    <span className="hist">
                      <i />
                      Published · Yesterday
                    </span>
                    <span className="pub-btn">Publish update</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="frow">
              <div className="fr-text">
                <span className="tile c2">
                  <Icon name="globe" className="ico" />
                </span>
                <div className="eyebrow plain">Domains</div>
                <h2>Your address on the web</h2>
                <p className="lead">
                  Every website starts on a free sub-domain. Connect your own domain when you are ready.
                </p>
                <ul className="ticks">
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Free sub-domain from day one</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>Step-by-step domain connection</span>
                  </li>
                  <li>
                    <Icon name="check" className="tk" />
                    <span>[Confirm: SSL and domain purchase in Phase 1]</span>
                  </li>
                </ul>
              </div>
              <div className="fr-vis c2-bg">
                <div className="ui domui">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                    <span>Domain</span>
                  </div>
                  <div className="dom">
                    <div className="dom-row">
                      <span className="dom-url">🔒 www.yourbusiness.com</span>
                      <b className="ui-pill mint">Connected</b>
                    </div>
                    <div className="dom-row muted2">
                      <span className="dom-url">yourbusiness.platform-domain.com</span>
                      <b className="ui-pill">Default</b>
                    </div>
                    <div className="dom-steps">
                      <em className="done">1 Add domain</em>
                      <em className="done">2 Update DNS</em>
                      <em className="done">3 Live</em>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">Compare</div>
            <h2>Manual builder or AI builder?</h2>
            <p className="lead">Use either one, or both on the same website.</p>
          </div>
          <div className="cmp">
            <table>
              <thead>
                <tr>
                  <th scope="col">You want to…</th>
                  <th scope="col">Manual builder</th>
                  <th scope="col">AI builder</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Start from a template you choose</td>
                  <td>
                    <b className="y">Yes</b>
                  </td>
                  <td>AI chooses, you can change it</td>
                </tr>
                <tr>
                  <td>Get pages and content written for you</td>
                  <td>
                    <b className="n">No</b>
                  </td>
                  <td>
                    <b className="y">Yes</b>
                  </td>
                </tr>
                <tr>
                  <td>Edit every section by hand</td>
                  <td>
                    <b className="y">Yes</b>
                  </td>
                  <td>
                    <b className="y">Yes</b>
                  </td>
                </tr>
                <tr>
                  <td>Ask for changes in plain words</td>
                  <td>Use "Ask AI"</td>
                  <td>
                    <b className="y">Yes</b>
                  </td>
                </tr>
                <tr>
                  <td>Review before going live</td>
                  <td>
                    <b className="y">Yes</b>, drafts
                  </td>
                  <td>
                    <b className="y">Yes</b>, drafts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
