class GeosController < ApplicationController
  
  def all
    @cities = Geo.roots
  end
  
  def show
    @city = Geo.find(params[:id])
    if @city.children.blank?
      setup_destination_stuff(@city)

      render :action => "destination"
    else
      @cities = @city.children
      render :action => "province"
    end
  end
  
  def search
    @query = params[:city]
    if !@query.to_s.strip.empty?
      tokens = @query.split.collect {|c| "%#{c.downcase}%"}
      @cities = Geo.find(:all, :conditions => [(["(LOWER(name) LIKE ?)"] * tokens.size).join(" AND "), * tokens])
      #logger.info("CITY: #{@city.inspect}")
      
      # search result
      #@cities = @city.collect{|c| }
=begin
      @schools = School.paginate(:per_page => 20,:page => params[:page],
                  :conditions => [(["(LOWER(address) LIKE ? OR LOWER(traffic_description) LIKE ? 
                  OR LOWER(title) LIKE ?)"] * tokens.size).join(" AND ") + 
                  "AND is_hidden = '0'",
                  * tokens.collect { |token| [token] * 3 }.flatten],
                                    :order => "created_at DESC")
=end
    else
      flash[:notice] = "您没输入搜索词"
      @cities = Geo.roots
      render :action => "action"
    end
  end
  
  def schools
    @city = Geo.find(params[:id])
    @schools = School.at(@city).paginate(:page => params[:page] || 1,
                                         :order => "updated_at desc",
                                         :per_page => 20)
  end
  
  
  
  # for multiple drop down select
  def geo_choice
    if !params[:root].blank?
      if params[:root].to_i == 0
        # 用户选了不限地域
        @geos = [{:name => "不限地域", :id => 0}]
      else
        @root = Geo.find(params[:root])
        if @root.children.size > 0
          @geos = @root.children.collect{|r| {:name => r.name, :id => r.id} }
        else
          @geos = [ {:name => @root.name, :id => @root.id} ]
        end
      end
    else
      @geos = Array.new
    end
    render :partial => "/geos/geo_selector", :locals => { :object => params[:object], :method => params[:method] }
  end
  
  def county_choice
    if !params[:geo].blank?
      @geo = Geo.find(params[:geo])
      if @geo.counties.size > 0
        @counties = @geo.counties
      else
        @counties = []
      end
      render :partial => "geo_selector", :locals => { :object => "school", :method => "county" }
    end
  end
  
  private 
  def setup_destination_stuff(city)
    @schools = School.at(city).find(:all, :order => "last_modified_at desc", 
                                           :limit => 10,
                                           :include => [:shares, :visited])
    @shares = city.shares.find(:all, :order => "comments_count desc")
    @activities = Activity.available.ongoing.find(:all, :conditions => ["arrival_id=?", city.id],
                                                        :order => "start_at desc",
                                                        :select => "id, title, start_at")
  end
  
end