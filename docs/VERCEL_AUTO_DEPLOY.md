# Vercel ?ë™ ë°°í¬ ?¤ì • (main ?¸ì‹œ ??engcore-lms.vercel.app)

GitHub: `https://github.com/kmjh734-max/jeongsu-lms`  
?„ë¡œ?•ì…˜ URL: `https://engcore-lms.vercel.app` (Vercel ?„ë¡œ?íŠ¸ëª?`engcore`)

## ë°©ë²• A ??ì¶”ì²œ: Vercel ??GitHub ?°ê²° (?¤ì • ??ë²?

1. [Vercel Dashboard](https://vercel.com/dashboard) ???„ë¡œ?íŠ¸ **engcore** (êµ?`jeongsu-lms`)
2. **Settings** ??**Git**
3. **Connect Git Repository** ??`kmjh734-max/jeongsu-lms` ? íƒ
4. **Production Branch**: `main`
5. **Deploy Hooks** / ?ë™ ë°°í¬: ê¸°ë³¸ ON

?´í›„ `main`??`git push` ???Œë§ˆ??Vercel???ë™?¼ë¡œ ë¹Œë“œÂ·ë°°í¬?©ë‹ˆ??  
(GitHub Actions ?†ì´???™ì‘?©ë‹ˆ??)

### ?˜ê²½ ë³€??(?„ë¡œ?•ì…˜)

Vercel ??**Settings** ??**Environment Variables**:

| ?´ë¦„ | ?˜ê²½ |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Production |
| `NEXT_PUBLIC_SITE_URL` | Production ??`https://engcore-lms.vercel.app` |

Supabase ??**Authentication** ??URL Configuration?? 
`https://engcore-lms.vercel.app` ì¶”ê? (ê¸°ì¡´ `jeongsu-lms.vercel.app`???¹ë¶„ê°?? ì? ê°€??.

---

## Queue??ë°°í¬ê°€ ?“ì¼ ??(?ì£¼ ë°œìƒ)

**ì¦ìƒ:** Vercel Deployments??`Queued`ë§??¬ëŸ¬ ê°??“ì´ê³??„ë¡œ?•ì…˜????ë°”ë€?

**?ì¸:** `main` ?¸ì‹œë§ˆë‹¤ **Vercel Git ?ë™ ë°°í¬**?€ **GitHub Actions Deploy Hook**??**????* ?Œì•„ê°€ë©? ë¬´ë£Œ ?Œëœ?ì„œ ë¹Œë“œ ?€ê¸°ì—´??ê½?ì°¹ë‹ˆ??

**?´ê²°:**

1. [Vercel Deployments](https://vercel.com/dashboard) ??**engcore** ??`Queued` / `Canceled` ê°€?¥í•œ ?¤ë˜??ë°°í¬??**Cancel** (ìµœì‹  1ê°œë§Œ ?¨ê¸°ê¸?
2. **??ì¤??˜ë‚˜ë§?* ?¬ìš©
   - **ì¶”ì²œ:** Vercel Git ?°ë™ë§?(Actions ?Œí¬?Œë¡œ??`workflow_dispatch` ?˜ë™ë§?
   - ?ëŠ” Git ?°ë™ ?„ê³  Deploy Hook + Actionsë§?
3. ìµœì‹  ì»¤ë°‹?¼ë¡œ **Redeploy** ??ë²?(Deployments ??????Redeploy)

???€?¥ì†Œ??Actionsê°€ `push`ë§ˆë‹¤ ?…ì„ ?¸ì¶œ?˜ì? ?Šë„ë¡??˜ì •?˜ì–´ ?ˆìŠµ?ˆë‹¤. (`workflow_dispatch`ë§?

---

## ë°©ë²• B: GitHub Actions + Deploy Hook (Aê°€ ??????

1. Vercel ???„ë¡œ?íŠ¸ ??**Settings** ??**Git** ??**Deploy Hooks**
2. Name: `github-main`, Branch: `main` ??URL ë³µì‚¬
3. GitHub ??`jeongsu-lms` ??**Settings** ??**Secrets and variables** ??**Actions**
4. **New repository secret**
   - Name: `VERCEL_DEPLOY_HOOK`
   - Value: (ë³µì‚¬??Deploy Hook URL)
5. `main`???¸ì‹œ ??Actions ?Œí¬?Œë¡œ `Deploy to Vercel (Production)` ?¤í–‰

?Œí¬?Œë¡œ ?Œì¼: `.github/workflows/deploy-production.yml`

---

## ë°°í¬ ?•ì¸

- Vercel ??**Deployments** ??—??ìµœì‹  ì»¤ë°‹Â·?íƒœ ?•ì¸
- ?±ê³µ ??https://engcore-lms.vercel.app ?‘ì†
