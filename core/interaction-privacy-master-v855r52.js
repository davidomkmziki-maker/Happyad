(function(){
'use strict';
if(window.HappyInteractionPrivacyV855R52)return;
var policyCache=new Map(),postCache=new Map(),storyCache=new Map();
function clean(v){return String(v==null?'':v).trim();}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v));}
function bool(v,f){if(v===true||v===false)return v;var s=clean(v).toLowerCase();if(s==='true'||s==='1'||s==='yes'||s==='on')return true;if(s==='false'||s==='0'||s==='no'||s==='off')return false;return !!f;}
function client(){
  try{
    if(typeof window.happyadSb==='function'){var a=window.happyadSb();if(a&&a.rpc)return a;}
    if(window.happyadSupabase&&window.happyadSupabase.rpc)return window.happyadSupabase;
    if(window.supabaseClient&&window.supabaseClient.rpc)return window.supabaseClient;
    if(window.supabase&&window.supabase.createClient&&window.HAPPYAD_SUPABASE_URL&&window.HAPPYAD_SUPABASE_KEY){
      window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      return window.happyadSupabase;
    }
  }catch(_e){}
  return null;
}
function normalizePolicy(data){
  var row=Array.isArray(data)?(data[0]||{}):(data||{});
  return {
    comments:bool(row.comments_allowed,true),
    reposts:bool(row.reposts_allowed,true),
    storyReplies:bool(row.story_replies_allowed,true),
    mentions:bool(row.mentions_allowed,true),
    tags:bool(row.tags_allowed,true),
    available:true
  };
}
function safePolicy(){return {comments:false,reposts:false,storyReplies:false,mentions:false,tags:false,available:false};}
function kindKey(kind){
  var k=clean(kind).toLowerCase().replace(/[\s-]+/g,'_');
  if(k==='comment'||k==='comments'||k==='commentaire'||k==='commentaires')return 'comments';
  if(k==='share'||k==='shares'||k==='partage'||k==='partages'||k==='repost'||k==='reposts'||k==='republish'||k==='republication'||k==='republications')return 'reposts';
  if(k==='story_reply'||k==='story_replies'||k==='reply_story'||k==='reponse_story')return 'storyReplies';
  if(k==='mention'||k==='mentions')return 'mentions';
  if(k==='tag'||k==='tags'||k==='identification'||k==='identifications')return 'tags';
  return k;
}
function allowedByPolicy(policy,kind){var k=kindKey(kind);return !!(policy&&policy.available&&policy[k]===true);}
async function loadPolicy(targetId,force){
  targetId=clean(targetId);if(!isUuid(targetId))return safePolicy();
  if(!force&&policyCache.has(targetId))return policyCache.get(targetId);
  var c=client();if(!c)return safePolicy();
  try{var r=await c.rpc('happyad_interaction_privacy_v855r52',{p_target:targetId});if(r&&r.error)throw r.error;var p=normalizePolicy(r&&r.data);policyCache.set(targetId,p);return p;}catch(_e){return safePolicy();}
}
async function loadPolicies(targetIds,force){
  var ids=Array.from(new Set((targetIds||[]).map(clean).filter(isUuid))).slice(0,100);if(!ids.length)return policyCache;
  var missing=force?ids:ids.filter(function(id){return !policyCache.has(id);});if(!missing.length)return policyCache;
  var c=client();if(!c)return policyCache;
  try{var r=await c.rpc('happyad_interaction_privacy_batch_v855r52',{p_targets:missing});if(r&&r.error)throw r.error;(Array.isArray(r.data)?r.data:[]).forEach(function(row){var id=clean(row&&row.target_user_id);if(id)policyCache.set(id,normalizePolicy(row));});}
  catch(_e){await Promise.all(missing.map(function(id){return loadPolicy(id,!!force);}));}
  return policyCache;
}
async function canTarget(targetId,kind,force){var p=await loadPolicy(targetId,!!force);return allowedByPolicy(p,kind);}
async function remoteAllowed(rpcName,args,cache,key,force){
  key=clean(key);if(!key)return false;if(!force&&cache.has(key))return cache.get(key);
  var c=client();if(!c)return false;
  try{var r=await c.rpc(rpcName,args);if(r&&r.error)throw r.error;var data=r&&r.data;var v=Array.isArray(data)?data[0]:data;if(v&&typeof v==='object'){if('allowed' in v)v=v.allowed;else if('happyad_interaction_post_allowed_v855r52' in v)v=v.happyad_interaction_post_allowed_v855r52;else if('happyad_interaction_story_allowed_v855r52' in v)v=v.happyad_interaction_story_allowed_v855r52;}var ok=bool(v,false);cache.set(key,ok);return ok;}catch(_e){return false;}
}
async function canPost(postId,kind,force){var k=clean(postId)+'::'+kindKey(kind);return remoteAllowed('happyad_interaction_post_allowed_v855r52',{p_post_id:clean(postId),p_kind:kindKey(kind)},postCache,k,!!force);}
async function canStory(storyId,kind,force){var k=clean(storyId)+'::'+kindKey(kind);return remoteAllowed('happyad_interaction_story_allowed_v855r52',{p_story_id:clean(storyId),p_kind:kindKey(kind)},storyCache,k,!!force);}
async function filterTargets(targetIds,kind){
  var ids=Array.from(new Set((targetIds||[]).map(clean).filter(isUuid))).slice(0,100);if(!ids.length)return [];
  await loadPolicies(ids,false);var k=kindKey(kind);return ids.filter(function(id){return allowedByPolicy(policyCache.get(id),k);});
}
function clear(){policyCache.clear();postCache.clear();storyCache.clear();}
window.HappyInteractionPrivacyV855R52={VERSION:'V855R52',loadPolicy:loadPolicy,loadPolicies:loadPolicies,canTarget:canTarget,canPost:canPost,canStory:canStory,filterTargets:filterTargets,allowedByPolicy:allowedByPolicy,kindKey:kindKey,clear:clear,safePolicy:safePolicy,policyCache:policyCache};
})();
