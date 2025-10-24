import { StackHandler } from "@stackframe/stack"; 
import { stackServerApp } from "../../../../stack/server"; 
import { redirect } from "next/navigation";

export default async function Handler(props: { params: Promise<{ stack: string[] }> }) { 
  const { stack } = await props.params
  
  // Redirect account-settings to /account
  if (stack.some(s => s.includes('account-settings'))) {
    redirect('/account')
  }

  return <StackHandler fullPage app={stackServerApp} routeProps={props} />
} 
