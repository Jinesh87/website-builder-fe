import { safeHref } from "../links.ts";
import { gridStyle, SectionHead, SectionShell, SiteImage, SiteLink } from "../primitives.tsx";
import type {
  SectionOf,
  TeamCardStyle,
  TeamMember,
  TeamSocialLink,
  TeamVariant,
} from "../types.ts";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function LinkedInIcon() {
  return (
    <svg className="wb-team-social-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3 7.5h3v9.5H3V7.5zM8 7.5h2.8v1.3h.04c.39-.74 1.34-1.52 2.77-1.52 2.96 0 3.51 1.95 3.51 4.48V17h-3v-4.63c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44V17H8V7.5z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="wb-team-social-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M14.6 3h2.3l-5 5.7L17.8 17h-4.6l-3.6-4.7L5.5 17H3.2l5.4-6.1L3 3h4.7l3.3 4.3L14.6 3zm-.8 12.6h1.3L6.3 4.3H4.9l8.9 11.3z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="wb-team-social-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0018 10c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="wb-team-social-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 4h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="19,6 10,13 1,6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="wb-team-social-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M8.5 11.5a4 4 0 005.66 0l2.83-2.83a4 4 0 00-5.66-5.66l-1.41 1.42" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 8.5a4 4 0 00-5.66 0L3.01 11.33a4 4 0 005.66 5.66l1.41-1.42" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="wb-team-pin-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a5 5 0 00-5 5c0 3.75 5 9 5 9s5-5.25 5-9a5 5 0 00-5-5zm0 6.75a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5z" />
    </svg>
  );
}

function SocialIconRender({ platform }: { platform: string }) {
  switch (platform) {
    case "linkedin":
      return <LinkedInIcon />;
    case "twitter":
      return <TwitterIcon />;
    case "github":
      return <GithubIcon />;
    case "email":
      return <EmailIcon />;
    default:
      return <LinkIcon />;
  }
}

function SocialList({ links }: { links?: TeamSocialLink[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="wb-team-socials" aria-label="Social links">
      {links.map((s, idx) => (
        <a
          key={idx}
          href={safeHref(s.url)}
          target={s.url.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="wb-team-social-btn"
          aria-label={s.platform}
        >
          <SocialIconRender platform={s.platform} />
        </a>
      ))}
    </div>
  );
}

function getCardStyleClass(cardStyle?: TeamCardStyle): string {
  switch (cardStyle) {
    case "bordered":
      return "wb-team-card-bordered";
    case "elevated":
      return "wb-team-card-elevated";
    case "flat":
      return "wb-team-card-flat";
    case "glass":
      return "wb-team-card-glass";
    case "contrast":
      return "wb-team-card-contrast";
    case "default":
    default:
      return "wb-team-card-default";
  }
}

function MemberAvatar({
  member,
  aspect = "square",
  className = "",
}: {
  member: TeamMember;
  aspect?: "square" | "portrait" | "circle";
  className?: string;
}) {
  const aspectClass =
    aspect === "portrait"
      ? "wb-team-avatar-portrait"
      : aspect === "circle"
        ? "wb-team-avatar-circle"
        : "wb-team-avatar-square";

  return (
    <div className={`wb-team-avatar-wrapper ${aspectClass} ${className}`}>
      {member.photo ? (
        <SiteImage image={member.photo} className="wb-team-avatar-img" />
      ) : (
        <div className="wb-team-avatar-initials" aria-hidden="true">
          <span>{initials(member.name)}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   VARIANT 1: Grid Cards (Executive Standard with Hover Polish)
   ========================================================================= */
function TeamGridCards({
  members,
  columns,
  mobileColumns,
  cardStyle,
}: {
  members: TeamMember[];
  columns: number;
  mobileColumns: number;
  cardStyle?: TeamCardStyle;
}) {
  const cardClass = getCardStyleClass(cardStyle);

  return (
    <ul
      className="wb-grid wb-team-grid"
      style={gridStyle(columns as 1 | 2 | 3 | 4, mobileColumns as 1 | 2 | 3 | 4)}
    >
      {members.map((member, index) => (
        <li key={index} className={`wb-team-card ${cardClass}`}>
          <div className="wb-team-card-media">
            <MemberAvatar member={member} aspect="portrait" />
            {member.department && (
              <span className="wb-team-dep-tag">{member.department}</span>
            )}
          </div>

          <div className="wb-team-card-body">
            <div className="wb-team-member-meta">
              <h3 className="wb-team-member-name">{member.name}</h3>
              {member.role && <p className="wb-team-member-role">{member.role}</p>}
            </div>

            {member.location && (
              <div className="wb-team-location">
                <PinIcon />
                <span>{member.location}</span>
              </div>
            )}

            {member.bio && <p className="wb-team-member-bio">{member.bio}</p>}

            {member.tags && member.tags.length > 0 && (
              <div className="wb-team-tags">
                {member.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="wb-team-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="wb-team-card-footer">
              <SocialList links={member.socialLinks} />
              {member.link && (
                <SiteLink link={member.link} className="wb-team-link-btn" />
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* =========================================================================
   VARIANT 2: Spotlight Featured (Prominent Leader + Roster)
   ========================================================================= */
function TeamSpotlightFeatured({
  members,
  cardStyle,
}: {
  members: TeamMember[];
  cardStyle?: TeamCardStyle;
}) {
  const leader = members[0];
  const roster = members.slice(1);
  const cardClass = getCardStyleClass(cardStyle);

  if (!leader) return null;

  return (
    <div className="wb-team-spotlight-layout">
      {/* Featured Leader Card */}
      <div className={`wb-team-leader-card ${cardClass}`}>
        <div className="wb-team-leader-media">
          <MemberAvatar member={leader} aspect="portrait" className="wb-team-leader-avatar" />
        </div>
        <div className="wb-team-leader-content">
          <div className="wb-team-leader-badge">
            <span className="wb-team-pulse-indicator" aria-hidden="true" />
            <span>{leader.department || "Leadership & Executive"}</span>
          </div>
          <h3 className="wb-team-leader-name">{leader.name}</h3>
          {leader.role && <p className="wb-team-leader-role">{leader.role}</p>}

          {leader.location && (
            <div className="wb-team-location">
              <PinIcon />
              <span>{leader.location}</span>
            </div>
          )}

          {leader.bio && <p className="wb-team-leader-bio">{leader.bio}</p>}

          {leader.tags && leader.tags.length > 0 && (
            <div className="wb-team-tags">
              {leader.tags.map((tag, tIdx) => (
                <span key={tIdx} className="wb-team-tag wb-team-tag-highlight">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="wb-team-leader-footer">
            <SocialList links={leader.socialLinks} />
            {leader.link && (
              <SiteLink link={leader.link} className="wb-team-link-btn wb-team-leader-action" />
            )}
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      {roster.length > 0 && (
        <div className="wb-team-roster-section">
          <div className="wb-team-roster-grid">
            {roster.map((member, index) => (
              <div key={index} className={`wb-team-roster-card ${cardClass}`}>
                <MemberAvatar member={member} aspect="square" className="wb-team-roster-avatar" />
                <div className="wb-team-roster-info">
                  <h4 className="wb-team-roster-name">{member.name}</h4>
                  {member.role && <p className="wb-team-roster-role">{member.role}</p>}
                  {member.department && (
                    <span className="wb-team-dep-tag-mini">{member.department}</span>
                  )}
                  {member.bio && <p className="wb-team-roster-bio">{member.bio}</p>}
                  <SocialList links={member.socialLinks} />
                  {member.link && (
                    <SiteLink link={member.link} className="wb-team-link-btn-subtle" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   VARIANT 3: Minimal Editorial (Swiss Architectural Line Roster)
   ========================================================================= */
function TeamMinimalEditorial({
  members,
}: {
  members: TeamMember[];
}) {
  return (
    <div className="wb-team-editorial-container">
      <div className="wb-team-editorial-list">
        {members.map((member, index) => (
          <div key={index} className="wb-team-editorial-item">
            <div className="wb-team-editorial-col-num">
              <span className="wb-team-editorial-index">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="wb-team-editorial-col-avatar">
              <MemberAvatar member={member} aspect="circle" className="wb-team-editorial-avatar" />
            </div>

            <div className="wb-team-editorial-col-primary">
              <h3 className="wb-team-editorial-name">{member.name}</h3>
              {member.role && <p className="wb-team-editorial-role">{member.role}</p>}
              {member.location && (
                <div className="wb-team-location wb-team-editorial-loc">
                  <PinIcon />
                  <span>{member.location}</span>
                </div>
              )}
            </div>

            <div className="wb-team-editorial-col-bio">
              {member.department && (
                <span className="wb-team-dep-tag">{member.department}</span>
              )}
              {member.bio && <p className="wb-team-editorial-bio">{member.bio}</p>}
              {member.tags && member.tags.length > 0 && (
                <div className="wb-team-tags">
                  {member.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="wb-team-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="wb-team-editorial-col-actions">
              <SocialList links={member.socialLinks} />
              {member.link && (
                <SiteLink link={member.link} className="wb-team-editorial-arrow-btn" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   VARIANT 4: Glass Overlay (Cinematic Hover Expansion Cards)
   ========================================================================= */
function TeamGlassOverlay({
  members,
  columns,
  mobileColumns,
}: {
  members: TeamMember[];
  columns: number;
  mobileColumns: number;
}) {
  return (
    <ul
      className="wb-grid wb-team-glass-grid"
      style={gridStyle(columns as 1 | 2 | 3 | 4, mobileColumns as 1 | 2 | 3 | 4)}
    >
      {members.map((member, index) => (
        <li key={index} className="wb-team-glass-card">
          <div className="wb-team-glass-bg-wrap">
            {member.photo ? (
              <SiteImage image={member.photo} className="wb-team-glass-img" />
            ) : (
              <div className="wb-team-glass-initials" aria-hidden="true">
                <span>{initials(member.name)}</span>
              </div>
            )}
            <div className="wb-team-glass-vignette" />
          </div>

          {member.department && (
            <div className="wb-team-glass-top-pill">
              <span>{member.department}</span>
            </div>
          )}

          <div className="wb-team-glass-sheet">
            <div className="wb-team-glass-summary">
              <h3 className="wb-team-glass-name">{member.name}</h3>
              {member.role && <p className="wb-team-glass-role">{member.role}</p>}
            </div>

            <div className="wb-team-glass-expandable">
              {member.location && (
                <div className="wb-team-location wb-team-glass-loc">
                  <PinIcon />
                  <span>{member.location}</span>
                </div>
              )}
              {member.bio && <p className="wb-team-glass-bio">{member.bio}</p>}
              {member.tags && member.tags.length > 0 && (
                <div className="wb-team-tags wb-team-glass-tags">
                  {member.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="wb-team-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="wb-team-glass-actions">
                <SocialList links={member.socialLinks} />
                {member.link && (
                  <SiteLink link={member.link} className="wb-team-glass-link" />
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */
export default function TeamSection({ section }: { section: SectionOf<"team"> }) {
  const { data } = section;
  const variant: TeamVariant = data.variant || "grid-cards";

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-team wb-team-variant-${variant}`}
      label={data.heading}
    >
      <div className={`wb-team-header-wrapper wb-align-${data.align || section.settings.align || "center"}`}>
        {data.eyebrow && <span className="wb-team-eyebrow">{data.eyebrow}</span>}
        <SectionHead heading={data.heading} intro={data.intro} align={data.align || section.settings.align || "center"} />
        {data.badge && (
          <div className="wb-team-badge-pill">
            <span className="wb-team-pulse-dot" aria-hidden="true" />
            <span>{data.badge}</span>
          </div>
        )}
      </div>

      {variant === "spotlight-featured" ? (
        <TeamSpotlightFeatured members={data.members} cardStyle={data.cardStyle} />
      ) : variant === "minimal-editorial" ? (
        <TeamMinimalEditorial members={data.members} />
      ) : variant === "glass-overlay" ? (
        <TeamGlassOverlay
          members={data.members}
          columns={data.columns}
          mobileColumns={data.mobileColumns}
        />
      ) : (
        <TeamGridCards
          members={data.members}
          columns={data.columns}
          mobileColumns={data.mobileColumns}
          cardStyle={data.cardStyle}
        />
      )}
    </SectionShell>
  );
}
