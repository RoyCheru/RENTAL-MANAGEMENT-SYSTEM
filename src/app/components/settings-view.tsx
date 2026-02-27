import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Settings, Bell, DollarSign, Mail, User, Building2, Save } from "lucide-react";
import { Separator } from "./ui/separator";

export function SettingsView() {
  const [settings, setSettings] = useState({
    smsReminders: true,
    emailNotifications: true,
    rentDueReminder: "3",
    overdueReminder: "1",
    lateFeeEnabled: true,
    lateFeeAmount: "50",
    lateFeeAfterDays: "5",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your system preferences and configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Sidebar */}
        <div className="space-y-2">
          <Button variant="default" className="w-full justify-start gap-2">
            <Settings className="size-4" />
            General
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Bell className="size-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <DollarSign className="size-4" />
            Payment Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <User className="size-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Building2 className="size-4" />
            Property Defaults
          </Button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Property Management Co." />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send automated SMS reminders to tenants</p>
                </div>
                <Switch
                  checked={settings.smsReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsReminders: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rent-due-reminder">Rent Due Reminder</Label>
                <Select
                  value={settings.rentDueReminder}
                  onValueChange={(value) => setSettings({ ...settings, rentDueReminder: value })}
                >
                  <SelectTrigger id="rent-due-reminder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="5">5 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Send reminder before rent is due</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overdue-reminder">Overdue Payment Reminder</Label>
                <Select
                  value={settings.overdueReminder}
                  onValueChange={(value) => setSettings({ ...settings, overdueReminder: value })}
                >
                  <SelectTrigger id="overdue-reminder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day after</SelectItem>
                    <SelectItem value="3">3 days after</SelectItem>
                    <SelectItem value="7">7 days after</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Send reminder after payment is overdue</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-template">SMS Template</Label>
                <Textarea
                  id="sms-template"
                  placeholder="Customize your SMS message..."
                  defaultValue="Hi {tenant_name}, this is a reminder that your rent of ${amount} is due on {due_date}. Thank you!"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">Use placeholders: {"{tenant_name}"}, {"{amount}"}, {"{due_date}"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods and late fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Late Fees</Label>
                  <p className="text-sm text-muted-foreground">Automatically apply late fees to overdue payments</p>
                </div>
                <Switch
                  checked={settings.lateFeeEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, lateFeeEnabled: checked })}
                />
              </div>

              {settings.lateFeeEnabled && (
                <>
                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="late-fee-amount">Late Fee Amount</Label>
                      <Input
                        id="late-fee-amount"
                        type="number"
                        placeholder="50"
                        value={settings.lateFeeAmount}
                        onChange={(e) => setSettings({ ...settings, lateFeeAmount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="late-fee-days">Apply After (Days)</Label>
                      <Input
                        id="late-fee-days"
                        type="number"
                        placeholder="5"
                        value={settings.lateFeeAfterDays}
                        onChange={(e) => setSettings({ ...settings, lateFeeAfterDays: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Payment Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label>Bank Transfer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label>Mobile Money</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label>Cash</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label>Check</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>General system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="kes">KES (KSh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="yyyy-mm-dd">
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                    <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button size="lg" className="gap-2">
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
